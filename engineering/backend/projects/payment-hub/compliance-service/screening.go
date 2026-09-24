package main

// Screener checks both parties of a transaction against a sanctions/AML watchlist. This must run
// BEFORE routing (see DESIGN.md section 3, step 3) — screening after a transaction is already
// routed defeats the point.
//
// This is a hardcoded blocklist standing in for a real OFAC/UN sanctions list lookup, and it's
// entirely local to this one service — a real bank's screening integrates with SBV's SIMO (the
// national fraud/AML information-sharing system across institutions), which this does not. See
// ../BUSINESS.md section 5 for the full regulation-to-coverage mapping. Do not reuse this as a
// real compliance control.
type Screener struct {
	blocked map[string]bool
}

func NewScreener() *Screener {
	return &Screener{
		blocked: map[string]bool{
			"SANCTIONED-TEST-ACCOUNT": true,
		},
	}
}

type ScreeningResult struct {
	Clear  bool   `json:"clear"`
	Reason string `json:"reason,omitempty"`
}

func (s *Screener) Screen(sourceAccount, destAccount string) ScreeningResult {
	if s.blocked[sourceAccount] {
		return ScreeningResult{Clear: false, Reason: "source account on watchlist"}
	}
	if s.blocked[destAccount] {
		return ScreeningResult{Clear: false, Reason: "destination account on watchlist"}
	}
	return ScreeningResult{Clear: true}
}
