package main

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"net"
	"os/exec"
	"regexp"
	"strings"
	"sync"
	"time"
)

var errNoEgress = errors.New("wired interface unavailable")

// egressState is the wired interface as seen right now. It is re-detected every few seconds so
// unplugging the RJ45 cable, a new DHCP lease, or swapping USB adapters is picked up without restart.
type egressState struct {
	Interface string   `json:"interface"`
	IP        string   `json:"ip"`
	DNS       []string `json:"dns"`

	ifIndex int
	ip      net.IP
}

type egress struct {
	ifaceFlag string
	dnsFlag   []string

	mu       sync.Mutex
	cached   *egressState
	cacheErr error
	cachedAt time.Time
}

const egressCacheTTL = 5 * time.Second

func (e *egress) state() (*egressState, error) {
	e.mu.Lock()
	defer e.mu.Unlock()
	if !e.cachedAt.IsZero() && time.Since(e.cachedAt) < egressCacheTTL {
		return e.cached, e.cacheErr
	}
	e.cached, e.cacheErr = e.detect()
	e.cachedAt = time.Now()
	return e.cached, e.cacheErr
}

func (e *egress) detect() (*egressState, error) {
	name := e.ifaceFlag
	if name == "" {
		var err error
		if name, err = detectWiredInterface(); err != nil {
			return nil, err
		}
	}
	ifi, err := net.InterfaceByName(name)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", errNoEgress, err)
	}
	ip := firstIPv4(ifi)
	if ip == nil {
		return nil, fmt.Errorf("%w: %s is down or has no IPv4 address", errNoEgress, name)
	}
	dns := e.dnsFlag
	if len(dns) == 0 {
		dns = interfaceDNS(name)
	}
	return &egressState{Interface: name, IP: ip.String(), DNS: dns, ifIndex: ifi.Index, ip: ip}, nil
}

// dial connects through the wired interface, resolving hostnames with that interface's DNS servers
// (the LAN's internal resolvers) rather than the system default, which follows Wi-Fi.
func (e *egress) dial(ctx context.Context, network, addr string) (net.Conn, error) {
	st, err := e.state()
	if err != nil {
		return nil, err
	}
	d := st.dialer(network)
	if len(st.DNS) > 0 {
		d.Resolver = &net.Resolver{
			PreferGo: true,
			Dial: func(ctx context.Context, network, _ string) (net.Conn, error) {
				var last error
				for _, server := range st.DNS {
					c, err := st.dialer(network).DialContext(ctx, network, net.JoinHostPort(server, "53"))
					if err == nil {
						return c, nil
					}
					last = err
				}
				return nil, last
			},
		}
	}
	return d.DialContext(ctx, network, addr)
}

func (s *egressState) dialer(network string) *net.Dialer {
	d := &net.Dialer{Timeout: 10 * time.Second, Control: bindToInterface(s.ifIndex)}
	if strings.HasPrefix(network, "udp") {
		d.LocalAddr = &net.UDPAddr{IP: s.ip}
	} else {
		d.LocalAddr = &net.TCPAddr{IP: s.ip}
	}
	return d
}

func firstIPv4(ifi *net.Interface) net.IP {
	if ifi.Flags&net.FlagUp == 0 {
		return nil
	}
	addrs, err := ifi.Addrs()
	if err != nil {
		return nil
	}
	for _, a := range addrs {
		if ipn, ok := a.(*net.IPNet); ok {
			if ip4 := ipn.IP.To4(); ip4 != nil && !ip4.IsLinkLocalUnicast() {
				return ip4
			}
		}
	}
	return nil
}

type hardwarePort struct{ Name, Device string }

var wiredPortName = regexp.MustCompile(`(?i)ethernet|\blan\b`)

// detectWiredInterface picks the first Ethernet/LAN hardware port that is up with an IPv4 address.
// Wi-Fi, Thunderbolt and bridge ports never qualify.
func detectWiredInterface() (string, error) {
	out, err := exec.Command("networksetup", "-listallhardwareports").Output()
	if err != nil {
		return "", fmt.Errorf("%w: networksetup: %v", errNoEgress, err)
	}
	for _, p := range parseHardwarePorts(string(out)) {
		if !wiredPortName.MatchString(p.Name) {
			continue
		}
		if ifi, err := net.InterfaceByName(p.Device); err == nil && firstIPv4(ifi) != nil {
			return p.Device, nil
		}
	}
	return "", fmt.Errorf("%w: no Ethernet/LAN port is connected", errNoEgress)
}

func parseHardwarePorts(out string) []hardwarePort {
	var ports []hardwarePort
	var cur hardwarePort
	sc := bufio.NewScanner(strings.NewReader(out))
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		switch {
		case strings.HasPrefix(line, "Hardware Port:"):
			cur = hardwarePort{Name: strings.TrimSpace(strings.TrimPrefix(line, "Hardware Port:"))}
		case strings.HasPrefix(line, "Device:") && cur.Name != "":
			cur.Device = strings.TrimSpace(strings.TrimPrefix(line, "Device:"))
			ports = append(ports, cur)
			cur = hardwarePort{}
		}
	}
	return ports
}

func interfaceDNS(iface string) []string {
	out, err := exec.Command("scutil", "--dns").Output()
	if err != nil {
		return nil
	}
	return parseScutilDNS(string(out), iface)
}

// parseScutilDNS returns the nameservers of every resolver block scoped to iface, deduplicated.
func parseScutilDNS(out, iface string) []string {
	var result, block []string
	seen := map[string]bool{}
	scoped := false
	flush := func() {
		if scoped {
			for _, ns := range block {
				if !seen[ns] {
					seen[ns] = true
					result = append(result, ns)
				}
			}
		}
		block, scoped = nil, false
	}
	sc := bufio.NewScanner(strings.NewReader(out))
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		key, value, ok := strings.Cut(line, ":")
		switch {
		case strings.HasPrefix(line, "resolver #"):
			flush()
		case ok && strings.HasPrefix(strings.TrimSpace(key), "nameserver["):
			block = append(block, strings.TrimSpace(value))
		case ok && strings.TrimSpace(key) == "if_index":
			scoped = strings.Contains(value, "("+iface+")")
		}
	}
	flush()
	return result
}
