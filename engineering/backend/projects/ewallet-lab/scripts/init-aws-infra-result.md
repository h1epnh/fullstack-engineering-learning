# init-aws-infra.sh — Kết quả chạy (ghi chú tay)

> Điền vào sau khi operator tự chạy `scripts/init-aws-infra.sh` bằng profile AWS admin của mình.
> **KHÔNG** ghi `SecretAccessKey` vào file này — file này commit lên git. Chỉ ghi `AccessKeyId`
> (không nhạy cảm nếu đứng riêng) để tiện tra cứu/xoay vòng key sau này.

- **Ngày chạy**: 2026-10-29
- **AWS account**: 456021728709
- **Region**: ap-southeast-1

## Resource đã tạo

| Resource | ARN / ID | Ghi chú |
|---|---|---|
| SNS topic `ewallet-lab-payment-completed` | `arn:aws:sns:ap-southeast-1:456021728709:ewallet-lab-payment-completed` | |
| SQS queue `ewallet-lab-payment-completed-notify` | `arn:aws:sqs:ap-southeast-1:456021728709:ewallet-lab-payment-completed-notify` | URL: `https://sqs.ap-southeast-1.amazonaws.com/456021728709/ewallet-lab-payment-completed-notify` |
| SQS DLQ `ewallet-lab-payment-completed-notify-dlq` | `arn:aws:sqs:ap-southeast-1:456021728709:ewallet-lab-payment-completed-notify-dlq` | maxReceiveCount=5 |
| SNS → SQS subscription | `arn:aws:sns:ap-southeast-1:456021728709:ewallet-lab-payment-completed:f86a2e85-d604-4fe5-9491-464edbeeff5c` | RawMessageDelivery=true |
| IAM policy `ewallet-lab-notify-policy` | `arn:aws:iam::456021728709:policy/ewallet-lab-notify-policy` | scoped: sns:Publish 1 topic + sqs:Receive/Delete/GetAttrs 2 queue |
| IAM user `ewallet-lab-notify-svc` | `arn:aws:iam::456021728709:user/ewallet-lab-notify-svc` | KHÔNG phải admin key |
| Access Key ID | `AKIAWULIDLXCRYM62333` | SecretAccessKey KHÔNG ghi ở đây — chỉ hiện 1 lần lúc tạo, đã dùng để tạo k8s Secret, không lưu ở đâu khác. **Lưu ý**: secret key này đã dán vào Claude Code chat (scrollback) khi báo kết quả — rủi ro thấp vì key chỉ scoped đúng 3 ARN trên (không phải admin), nhưng nếu muốn sạch tuyệt đối thì xoay vòng key (`aws iam create-access-key` mới + `delete-access-key` key cũ) sau khi đã tạo k8s Secret. |

## k8s Secret

- [ ] Đã tạo `kubectl -n ewallet-lab create secret generic ewallet-lab-aws-notify --from-literal=AWS_ACCESS_KEY_ID=... --from-literal=AWS_SECRET_ACCESS_KEY=... --from-literal=AWS_DEFAULT_REGION=ap-southeast-1`
- [ ] Verify: `kubectl -n ewallet-lab get secret ewallet-lab-aws-notify`

## Verify end-to-end (sau khi `notification-service` + publish ở `wallet-service` đã deploy)

- [ ] `kubectl -n ewallet-lab scale deploy/notification-service --replicas=1`
- [ ] Thực hiện 1 giao dịch thật (vd topup/transfer nhỏ) để `wallet-service` publish SNS
- [ ] Xem log `notification-service` nhận được message qua SQS (`kubectl -n ewallet-lab logs deploy/notification-service -f`)
- [ ] Scale lại `--replicas=0` sau khi test xong (tránh poll rỗng tốn free-tier SQS)

## Sự cố gặp phải khi chạy script (nếu có)

_(ghi lại lỗi/điều chỉnh thực tế khác với script gốc, để lần sau không lặp lại)_

## Trạng thái

- [x] Script đã chạy thành công (2026-10-29)
- [ ] k8s Secret đã tạo
- [ ] `notification-service` đã nhận được message thật từ SQS (verify end-to-end)

Liên quan: ADR-06 trong `DESIGN.md`, issue #129.
