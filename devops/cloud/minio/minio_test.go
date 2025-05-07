package main

import (
	"bytes"
	"context"
	"testing"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func TestMinioClient(t *testing.T) {
	endpoint := "localhost:9000"
	accessKeyID := "HpmmWbCFMDqElGDkmh6c"
	secretAccessKey := "MxERVnPX9lJYraPjK1JBfCPoXb8MBgFCmzW3s4y6"
	bucketName := "test-bucket"
	objectName := "test-object"
	content := "Hello, MinIO!"

	// Initialize the MinIO client object.
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: false,
	})
	if err != nil {
		t.Fatalf("Failed to create MinIO client: %v", err)
	}

	ctx := context.Background()

	// Test creating a bucket.
	err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
	if err != nil {
		t.Fatalf("Failed to create bucket: %v", err)
	}

	// Test uploading an object.
	_, err = client.PutObject(ctx, bucketName, objectName, bytes.NewReader([]byte(content)), int64(len(content)), minio.PutObjectOptions{})
	if err != nil {
		t.Fatalf("Failed to upload object: %v", err)
	}

	// Test downloading the object.
	object, err := client.GetObject(ctx, bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		t.Fatalf("Failed to get object: %v", err)
	}
	defer object.Close()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(object)
	if err != nil {
		t.Fatalf("Failed to read object: %v", err)
	}

	if buf.String() != content {
		t.Fatalf("Object content mismatch: got %v, want %v", buf.String(), content)
	}

	// Test deleting the object.
	err = client.RemoveObject(ctx, bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		t.Fatalf("Failed to delete object: %v", err)
	}

	// Test deleting the bucket.
	err = client.RemoveBucket(ctx, bucketName)
	if err != nil {
		t.Fatalf("Failed to delete bucket: %v", err)
	}
}