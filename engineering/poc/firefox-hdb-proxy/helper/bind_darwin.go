package main

import "syscall"

// bindToInterface sets IP_BOUND_IF so the kernel sends the socket out of that interface no matter
// which default route wins. Binding only the source IP is not enough on macOS: with Wi-Fi ranked
// first, packets would still leave via Wi-Fi.
func bindToInterface(index int) func(network, address string, c syscall.RawConn) error {
	return func(_, _ string, c syscall.RawConn) error {
		var serr error
		if err := c.Control(func(fd uintptr) {
			serr = syscall.SetsockoptInt(int(fd), syscall.IPPROTO_IP, syscall.IP_BOUND_IF, index)
		}); err != nil {
			return err
		}
		return serr
	}
}
