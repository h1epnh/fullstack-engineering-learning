package services

import (
	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

func GenerateTOTP(issuer, email string) (*totp.Key, error) {
	return totp.Generate(totp.GenerateOpts{
		Issuer:      issuer,
		AccountName: email,
	})
}

func ValidateTOTP(otp, secret string) bool {
	return totp.Validate(otp, secret)
}

func HashSecret(secret string) (string, error) {
	hashedSecret, err := bcrypt.GenerateFromPassword([]byte(secret), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedSecret), nil
}
