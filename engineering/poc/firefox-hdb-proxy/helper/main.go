// Command hdb-proxy is a local SOCKS5 proxy whose every outbound connection (and DNS query)
// is pinned to the wired RJ45 interface. The Firefox add-on sends *.hdbank.com.vn here; all other
// traffic goes direct and follows the normal default route (Wi-Fi).
package main

import (
	"encoding/json"
	"flag"
	"log"
	"net"
	"net/http"
	"strings"
)

func main() {
	listen := flag.String("listen", "127.0.0.1:1080", "SOCKS5 listen address")
	status := flag.String("status", "127.0.0.1:1081", "status endpoint listen address (empty disables)")
	iface := flag.String("iface", "", "wired interface to egress through, e.g. en10 (default: auto-detect Ethernet/LAN port)")
	dns := flag.String("dns", "", "comma-separated DNS servers reached over the wired interface (default: from scutil --dns)")
	flag.Parse()

	eg := &egress{ifaceFlag: *iface, dnsFlag: splitList(*dns)}
	if st, err := eg.state(); err != nil {
		log.Printf("wired interface not ready yet: %v", err)
	} else {
		log.Printf("egress via %s (%s), dns %v", st.Interface, st.IP, st.DNS)
	}

	if *status != "" {
		go serveStatus(*status, eg)
	}

	ln, err := net.Listen("tcp", *listen)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("SOCKS5 listening on %s", ln.Addr())
	log.Fatal(serveSOCKS(ln, eg.dial))
}

// serveStatus exposes GET /status for the add-on to poll. No CORS headers on purpose: the add-on
// reads it with host permissions, while ordinary web pages cannot.
func serveStatus(addr string, eg *egress) {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /status", func(w http.ResponseWriter, _ *http.Request) {
		st, err := eg.state()
		resp := struct {
			Up    bool   `json:"up"`
			Error string `json:"error,omitempty"`
			*egressState
		}{Up: err == nil, egressState: st}
		if err != nil {
			resp.Error = err.Error()
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		_ = json.NewEncoder(w).Encode(resp)
	})
	log.Printf("status endpoint on http://%s/status", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func splitList(s string) []string {
	var out []string
	for _, part := range strings.Split(s, ",") {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}
