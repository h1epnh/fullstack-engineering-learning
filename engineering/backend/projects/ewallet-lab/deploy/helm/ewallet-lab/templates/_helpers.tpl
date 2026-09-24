{{/*
Full image reference for one of this chart's own images (not third-party ones like postgres/kafka).
Usage: {{ include "ewallet-lab.image" (dict "root" . "name" "user-service") }}
*/}}
{{- define "ewallet-lab.image" -}}
{{- .root.Values.image.registry }}ewallet-lab/{{ .name }}:{{ .root.Values.image.tag }}
{{- end -}}
