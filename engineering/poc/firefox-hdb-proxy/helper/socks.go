package main

import (
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"strconv"
	"syscall"
	"time"
)

// Minimal SOCKS5 server (RFC 1928): no-auth, CONNECT only. That is all Firefox needs for
// {type: "socks", proxyDNS: true} — hostnames arrive as ATYP 0x03 and are resolved here,
// over the wired interface, instead of by Firefox over Wi-Fi.

const (
	socksVersion = 0x05

	repSucceeded          = 0x00
	repGeneralFailure     = 0x01
	repNetworkUnreachable = 0x03
	repHostUnreachable    = 0x04
	repConnRefused        = 0x05
	repCmdNotSupported    = 0x07
	repAddrNotSupported   = 0x08
)

type dialFunc func(ctx context.Context, network, addr string) (net.Conn, error)

func serveSOCKS(ln net.Listener, dial dialFunc) error {
	for {
		c, err := ln.Accept()
		if err != nil {
			return err
		}
		go handleConn(c, dial)
	}
}

func handleConn(c net.Conn, dial dialFunc) {
	defer c.Close()
	_ = c.SetDeadline(time.Now().Add(30 * time.Second))

	target, err := handshake(c)
	if err != nil {
		log.Printf("socks handshake from %s: %v", c.RemoteAddr(), err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	upstream, err := dial(ctx, "tcp4", target)
	cancel()
	if err != nil {
		log.Printf("connect %s: %v", target, err)
		_ = writeReply(c, replyCode(err))
		return
	}
	defer upstream.Close()

	if err := writeReply(c, repSucceeded); err != nil {
		return
	}
	_ = c.SetDeadline(time.Time{})
	pipe(c, upstream)
}

// handshake negotiates no-auth and reads a CONNECT request, returning "host:port".
func handshake(rw io.ReadWriter) (string, error) {
	hdr := make([]byte, 2)
	if _, err := io.ReadFull(rw, hdr); err != nil {
		return "", err
	}
	if hdr[0] != socksVersion {
		return "", fmt.Errorf("unsupported SOCKS version %d", hdr[0])
	}
	methods := make([]byte, hdr[1])
	if _, err := io.ReadFull(rw, methods); err != nil {
		return "", err
	}
	if !bytes.Contains(methods, []byte{0x00}) {
		_, _ = rw.Write([]byte{socksVersion, 0xFF})
		return "", errors.New("client offered no acceptable auth method")
	}
	if _, err := rw.Write([]byte{socksVersion, 0x00}); err != nil {
		return "", err
	}

	req := make([]byte, 4)
	if _, err := io.ReadFull(rw, req); err != nil {
		return "", err
	}
	if req[0] != socksVersion {
		return "", fmt.Errorf("unsupported SOCKS version %d", req[0])
	}
	if req[1] != 0x01 {
		_ = writeReply(rw, repCmdNotSupported)
		return "", fmt.Errorf("unsupported command %d", req[1])
	}

	var host string
	switch req[3] {
	case 0x01, 0x04:
		size := net.IPv4len
		if req[3] == 0x04 {
			size = net.IPv6len
		}
		b := make([]byte, size)
		if _, err := io.ReadFull(rw, b); err != nil {
			return "", err
		}
		host = net.IP(b).String()
	case 0x03:
		l := make([]byte, 1)
		if _, err := io.ReadFull(rw, l); err != nil {
			return "", err
		}
		b := make([]byte, l[0])
		if _, err := io.ReadFull(rw, b); err != nil {
			return "", err
		}
		host = string(b)
	default:
		_ = writeReply(rw, repAddrNotSupported)
		return "", fmt.Errorf("unsupported address type %d", req[3])
	}

	p := make([]byte, 2)
	if _, err := io.ReadFull(rw, p); err != nil {
		return "", err
	}
	return net.JoinHostPort(host, strconv.Itoa(int(binary.BigEndian.Uint16(p)))), nil
}

func writeReply(w io.Writer, rep byte) error {
	// BND.ADDR/BND.PORT are zeroed; Firefox ignores them for CONNECT.
	_, err := w.Write([]byte{socksVersion, rep, 0x00, 0x01, 0, 0, 0, 0, 0, 0})
	return err
}

func replyCode(err error) byte {
	var dnsErr *net.DNSError
	switch {
	case errors.Is(err, errNoEgress), errors.Is(err, syscall.ENETUNREACH):
		return repNetworkUnreachable
	case errors.As(err, &dnsErr), errors.Is(err, syscall.EHOSTUNREACH):
		return repHostUnreachable
	case errors.Is(err, syscall.ECONNREFUSED):
		return repConnRefused
	}
	return repGeneralFailure
}

func pipe(a, b net.Conn) {
	done := make(chan struct{}, 2)
	cp := func(dst, src net.Conn) {
		_, _ = io.Copy(dst, src)
		if tc, ok := dst.(*net.TCPConn); ok {
			_ = tc.CloseWrite()
		}
		done <- struct{}{}
	}
	go cp(a, b)
	go cp(b, a)
	<-done
	<-done
}
