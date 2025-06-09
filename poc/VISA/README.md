# generate private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
 
# generate public key
openssl rsa -pubout -in private_key.pem -out public_key.pem

		
when uploading public key to portal remove header and footer (-----BEGIN PUBLIC KEY---- and ----- END PUBLIC KEY-----) as well as new lines
# Show public key without new lines
cat public_key.pem | tr -d '\r\n'



# 1. Extract the certificate (.crt):
openssl x509 -outform PEM -in visa_cert.pem -out certificate.crt

openssl rsa -in visa_cert.pem -out private.key