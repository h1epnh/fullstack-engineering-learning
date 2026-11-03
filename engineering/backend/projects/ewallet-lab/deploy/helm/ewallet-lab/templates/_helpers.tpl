{{/*
Full image reference for one of this chart's own images (not third-party ones like postgres/kafka).
Usage: {{ include "ewallet-lab.image" (dict "root" . "name" "user-service") }}
*/}}
{{- define "ewallet-lab.image" -}}
{{- .root.Values.image.registry }}ewallet-lab/{{ .name }}:{{ .root.Values.image.tag }}
{{- end -}}

{{/*
Issue #53 (TD-01) — resources block for one Deployment, read from the central `resources` map in
values.yaml. `required` makes a NEW service without an entry fail `helm template`/`helm lint`
instead of silently deploying as BestEffort.
Usage: {{- include "ewallet-lab.resources" (dict "root" $ "name" "user-service") | nindent 10 }}
*/}}
{{- define "ewallet-lab.resources" -}}
{{- $r := required (printf "values.yaml resources.%s is missing (issue #53: every Deployment must declare requests/limits)" .name) (index .root.Values.resources .name) -}}
resources:
  requests:
    memory: {{ $r.requests.memory }}
    cpu: {{ $r.requests.cpu }}
  limits:
    memory: {{ $r.limits.memory }}
    {{- if $r.limits.cpu }}
    cpu: {{ $r.limits.cpu }}
    {{- end }}
{{- end -}}

{{/* JVM flags for every Java service: heap capped as a % of the container memory limit. */}}
{{- define "ewallet-lab.javaToolOptions" -}}
-XX:MaxRAMPercentage={{ .Values.jvm.maxRamPercentage }} -XX:+ExitOnOutOfMemoryError
{{- end -}}

{{/*
Issue #54 (TD-02) — per-Deployment replicas. Default is the template's own value; `replicaOverrides`
(values-local.yaml sets mock-bank-gateway/mfe-bill-payment/mfe-topup to 0 on purpose) wins if present.
Usage: {{ include "ewallet-lab.replicas" (dict "root" $ "name" "mfe-topup" "default" .Values.frontend.replicas) }}
*/}}
{{- define "ewallet-lab.replicas" -}}
{{- if hasKey (.root.Values.replicaOverrides | default dict) .name -}}
{{- index .root.Values.replicaOverrides .name -}}
{{- else -}}
{{- .default -}}
{{- end -}}
{{- end -}}

{{/*
Issue #54 (TD-02) — probe tuning that used to exist only on the live cluster (applied with `kubectl
patch`, field-manager `kubectl-patch`). Declared in values.yaml `probeOverrides.<name>`; renders
failureThreshold/timeoutSeconds when present. Usage inside a probe block, after periodSeconds:
{{- include "ewallet-lab.probeExtras" (dict "root" $ "name" "bnpl-service") | nindent 12 }}
*/}}
{{- define "ewallet-lab.probeExtras" -}}
{{- $o := index (.root.Values.probeOverrides | default dict) .name | default dict -}}
{{- if $o.failureThreshold }}
failureThreshold: {{ $o.failureThreshold }}
{{- end }}
{{- if $o.timeoutSeconds }}
timeoutSeconds: {{ $o.timeoutSeconds }}
{{- end }}
{{- end -}}
