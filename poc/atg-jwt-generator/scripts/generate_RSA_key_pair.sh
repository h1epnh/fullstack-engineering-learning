# generate a private key
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048

# convert it to PKCS#8 format
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private_key.pem -out private_key_pkcs8.pem

# extract the public key from the private key in PKCS#8 format
openssl rsa -pubout -in private_key_pkcs8.pem -out public_key.pem

# share public key with the client (ATG)


# convert private key to base64 format without the header and footer
awk 'NR>1 && !/END PRIVATE KEY/ {printf "%s", $0}' ../src/main/resources/private_key_pkcs8.pem


# test API with curl
curl -X GET http://localhost:8080/v1/token