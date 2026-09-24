# tools/

Third-party projects vendored for local use — plain copies of upstream source, not code authored
in this repository. Don't edit files inside these directories directly; changes belong upstream.
No longer tracked as git submodules (flattened on 2026-08-20); update a tool by re-cloning its
upstream and replacing the directory contents.

| Path | Upstream | Purpose |
| --- | --- | --- |
| `security/automation-mobsf` | [ZachGeo/Automation-MobSF](https://github.com/ZachGeo/Automation-MobSF) | MobSF automation scripts |
| `security/phonesploit` | [prbhtkumr/PhoneSploit](https://github.com/prbhtkumr/PhoneSploit) | Android ADB exploitation |
| `security/uber-apk-signer` | [patrickfav/uber-apk-signer](https://github.com/patrickfav/uber-apk-signer) | APK signing utility |
| `messaging/mq-container` | [ibm-messaging/mq-container](https://github.com/ibm-messaging/mq-container) | IBM MQ container images (`downloads/` gitignored — large installer binaries, not source) |
| `workflow/conductor-community` | [Netflix Conductor OSS](https://github.com/Netflix/conductor) (discontinued, plain copy) | Workflow orchestration engine |
| `analytics/redash` | [getredash/redash](https://github.com/getredash/redash) | BI/dashboarding tool — community-maintenance mode since the 2020 Databricks acquisition (last major release v10, late 2021; only security/dependency patches since) |
| `analytics/redash-setup` | [getredash/setup](https://github.com/getredash/setup) | Redash deployment scripts |

`security/mobsf` (1.7GB) and `orchestration/container` (1.2GB) were removed entirely — too large to
vendor as plain files. Re-clone from
[MobSF/Mobile-Security-Framework-MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF)
or [apple/container](https://github.com/apple/container) directly if needed again.

See `analytics/README.md` for local Redash build/setup notes.
