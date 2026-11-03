package main

import (
	"context"
	"encoding/binary"
	"io"
	"net"
	"reflect"
	"strconv"
	"testing"
)

const hardwarePortsSample = `
Hardware Port: USB 10/100 LAN
Device: en10
Ethernet Address: dc:04:5a:4b:0d:87

Hardware Port: Thunderbolt Bridge
Device: bridge0
Ethernet Address: 36:8c:47:47:58:00

Hardware Port: Wi-Fi
Device: en0
Ethernet Address: c8:89:f3:e3:eb:bd

VLAN Configurations
===================
`

func TestParseHardwarePorts(t *testing.T) {
	got := parseHardwarePorts(hardwarePortsSample)
	want := []hardwarePort{{"USB 10/100 LAN", "en10"}, {"Thunderbolt Bridge", "bridge0"}, {"Wi-Fi", "en0"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
	var wired []string
	for _, p := range got {
		if wiredPortName.MatchString(p.Name) {
			wired = append(wired, p.Device)
		}
	}
	if !reflect.DeepEqual(wired, []string{"en10"}) {
		t.Fatalf("wired ports = %v, want [en10]", wired)
	}
}

const scutilSample = `
DNS configuration

resolver #1
  nameserver[0] : 8.8.8.8
  if_index : 15 (en0)
  flags    : Request A records

resolver #2
  domain   : local
  options  : mdns

DNS configuration (for scoped queries)

resolver #1
  nameserver[0] : 8.8.8.8
  if_index : 15 (en0)

resolver #2
  nameserver[0] : 10.0.26.77
  nameserver[1] : 10.0.26.88
  if_index : 13 (en10)
  flags    : Scoped, Request A records
`

func TestParseScutilDNS(t *testing.T) {
	if got := parseScutilDNS(scutilSample, "en10"); !reflect.DeepEqual(got, []string{"10.0.26.77", "10.0.26.88"}) {
		t.Fatalf("en10 = %v", got)
	}
	if got := parseScutilDNS(scutilSample, "en0"); !reflect.DeepEqual(got, []string{"8.8.8.8"}) {
		t.Fatalf("en0 = %v", got)
	}
	if got := parseScutilDNS(scutilSample, "en1"); got != nil {
		t.Fatalf("en1 = %v, want none", got)
	}
}

func startSOCKS(t *testing.T) (string, *string) {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ln.Close() })
	dialed := new(string)
	var d net.Dialer
	go serveSOCKS(ln, func(ctx context.Context, network, addr string) (net.Conn, error) {
		*dialed = addr
		_, port, _ := net.SplitHostPort(addr)
		return d.DialContext(ctx, network, net.JoinHostPort("127.0.0.1", port))
	})
	return ln.Addr().String(), dialed
}

func startEcho(t *testing.T) int {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ln.Close() })
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			go func() { defer c.Close(); _, _ = io.Copy(c, c) }()
		}
	}()
	return ln.Addr().(*net.TCPAddr).Port
}

func socksRequest(t *testing.T, proxy string, cmd byte, host string, port int) (net.Conn, byte) {
	t.Helper()
	c, err := net.Dial("tcp", proxy)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { c.Close() })
	if _, err := c.Write([]byte{5, 1, 0}); err != nil {
		t.Fatal(err)
	}
	sel := make([]byte, 2)
	if _, err := io.ReadFull(c, sel); err != nil || sel[1] != 0 {
		t.Fatalf("method selection %v, %v", sel, err)
	}
	req := []byte{5, cmd, 0, 3, byte(len(host))}
	req = append(req, host...)
	req = binary.BigEndian.AppendUint16(req, uint16(port))
	if _, err := c.Write(req); err != nil {
		t.Fatal(err)
	}
	rep := make([]byte, 10)
	if _, err := io.ReadFull(c, rep); err != nil {
		t.Fatal(err)
	}
	return c, rep[1]
}

func TestSOCKSConnectByHostname(t *testing.T) {
	proxy, dialed := startSOCKS(t)
	port := startEcho(t)

	c, rep := socksRequest(t, proxy, 0x01, "portal.hdbank.com.vn", port)
	if rep != repSucceeded {
		t.Fatalf("reply = %d", rep)
	}
	if want := net.JoinHostPort("portal.hdbank.com.vn", strconv.Itoa(port)); *dialed != want {
		t.Fatalf("dialed %q, want %q (hostname must reach the helper unresolved)", *dialed, want)
	}
	if _, err := c.Write([]byte("ping")); err != nil {
		t.Fatal(err)
	}
	buf := make([]byte, 4)
	if _, err := io.ReadFull(c, buf); err != nil || string(buf) != "ping" {
		t.Fatalf("echo = %q, %v", buf, err)
	}
}

func TestSOCKSRejectsBind(t *testing.T) {
	proxy, _ := startSOCKS(t)
	if _, rep := socksRequest(t, proxy, 0x02, "example.com", 80); rep != repCmdNotSupported {
		t.Fatalf("reply = %d, want %d", rep, repCmdNotSupported)
	}
}

func TestReplyCodeNoEgress(t *testing.T) {
	if got := replyCode(errNoEgress); got != repNetworkUnreachable {
		t.Fatalf("got %d", got)
	}
}
