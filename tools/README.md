# tools/

Third-party projects cloned for local use, tracked as git submodules — not code authored in this
repository. Don't edit files inside these directories directly; changes belong upstream.

After cloning this repo, run:

```
git submodule update --init --recursive
```

| Path | Upstream | Purpose |
| --- | --- | --- |
| `security/mobsf` | [MobSF/Mobile-Security-Framework-MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF) | Mobile app security testing |
| `security/automation-mobsf` | [ZachGeo/Automation-MobSF](https://github.com/ZachGeo/Automation-MobSF) | MobSF automation scripts |
| `security/phonesploit` | [prbhtkumr/PhoneSploit](https://github.com/prbhtkumr/PhoneSploit) | Android ADB exploitation |
| `security/uber-apk-signer` | [patrickfav/uber-apk-signer](https://github.com/patrickfav/uber-apk-signer) | APK signing utility |
| `messaging/mq-container` | [ibm-messaging/mq-container](https://github.com/ibm-messaging/mq-container) | IBM MQ container images |
| `orchestration/container` | [apple/container](https://github.com/apple/container) | Apple's container runtime |
| `workflow/flowise` | [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) | Low-code LLM workflow builder |
| `workflow/conductor-community` | [Netflix Conductor OSS](https://github.com/Netflix/conductor) (discontinued, plain copy — no pinned submodule commit) | Workflow orchestration engine |
| `feature-flags/unleash` | [unleash/unleash](https://github.com/unleash/unleash) | Feature flag service (pending: see repo root for setup note) |
| `analytics/redash` | [getredash/redash](https://github.com/getredash/redash) | BI/dashboarding tool |
| `analytics/redash-setup` | [getredash/setup](https://github.com/getredash/setup) | Redash deployment scripts |

See `analytics/README.md` for local Redash build/setup notes.
