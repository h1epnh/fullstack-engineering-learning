import os
import subprocess
import xml.etree.ElementTree as ET
import glob
import time

JAVA_HOME = "/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home"
BASE_DIR = os.path.abspath("engineering/backend/projects/ewallet-lab")

GRADLE_SERVICES = [
    "user-service",
    "wallet-service",
    "topup-service",
    "transfer-service",
    "bill-payment-service",
    "lucky-money-service",
    "payment-request-service",
    "fund-service",
    "loyalty-service",
    "bnpl-service",
    "family-wallet-service",
    "investment-fund-service",
]

results = []

print("=== STARTING FULL BACKEND REGRESSION TEST ===")

env = os.environ.copy()
env["JAVA_HOME"] = JAVA_HOME
env["PATH"] = f"{JAVA_HOME}/bin:" + env.get("PATH", "")

for svc in GRADLE_SERVICES:
    svc_dir = os.path.join(BASE_DIR, svc)
    print(f"\n---> Testing {svc} in {svc_dir}...")
    start_t = time.time()
    cmd = ["./gradlew", "test", "--rerun-tasks"]
    proc = subprocess.run(cmd, cwd=svc_dir, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    duration = time.time() - start_t
    
    # Parse XML reports
    reports = glob.glob(os.path.join(svc_dir, "build/test-results/test/TEST-*.xml"))
    total_tests = 0
    total_failures = 0
    total_errors = 0
    total_skipped = 0
    
    for r in reports:
        try:
            tree = ET.parse(r)
            root = tree.getroot()
            total_tests += int(root.attrib.get("tests", 0))
            total_failures += int(root.attrib.get("failures", 0))
            total_errors += int(root.attrib.get("errors", 0))
            total_skipped += int(root.attrib.get("skipped", 0))
        except Exception as e:
            print(f"Error parsing {r}: {e}")
            
    status = "PASS" if proc.returncode == 0 and total_failures == 0 and total_errors == 0 else "FAIL"
    print(f"[{status}] {svc}: {total_tests} tests (fail: {total_failures}, err: {total_errors}, skip: {total_skipped}) in {duration:.1f}s")
    if proc.returncode != 0:
        print("Tail of failure output:")
        print("\n".join(proc.stdout.splitlines()[-20:]))
        
    results.append({
        "service": svc,
        "type": "gradle",
        "status": status,
        "tests": total_tests,
        "failures": total_failures,
        "errors": total_errors,
        "skipped": total_skipped,
        "duration": duration,
        "exit_code": proc.returncode
    })

# Test mock-bank-gateway (Go)
print("\n---> Testing mock-bank-gateway (Go)...")
mbg_dir = os.path.join(BASE_DIR, "mock-bank-gateway")
start_t = time.time()
go_proc = subprocess.run(["go", "test", "./..."], cwd=mbg_dir, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
go_duration = time.time() - start_t
go_status = "PASS" if go_proc.returncode == 0 else "FAIL"
print(f"[{go_status}] mock-bank-gateway in {go_duration:.1f}s")
print(go_proc.stdout.strip())
results.append({
    "service": "mock-bank-gateway",
    "type": "go",
    "status": go_status,
    "tests": 1 if go_status == "PASS" else 0,
    "failures": 0 if go_status == "PASS" else 1,
    "errors": 0,
    "skipped": 0,
    "duration": go_duration,
    "exit_code": go_proc.returncode
})

print("\n=== SUMMARY TABLE ===")
print(f"{'Service':<26} | {'Status':<6} | {'Tests':<6} | {'Failures':<8} | {'Errors':<6} | {'Duration'}")
print("-" * 70)
total_all_tests = 0
total_all_fails = 0
total_all_errors = 0
for r in results:
    total_all_tests += r["tests"]
    total_all_fails += r["failures"]
    total_all_errors += r["errors"]
    print(f"{r['service']:<26} | {r['status']:<6} | {r['tests']:<6} | {r['failures']:<8} | {r['errors']:<6} | {r['duration']:.1f}s")

print("-" * 70)
print(f"TOTAL: {total_all_tests} tests, {total_all_fails} failures, {total_all_errors} errors")
