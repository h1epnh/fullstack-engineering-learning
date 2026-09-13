package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type WorkflowInput struct {
	UserName string `json:"userName"`
}

func triggerWorkflow() error {
	// Conductor API endpoint
	url := "http://localhost:8080/api/workflow/simple_greeting_workflow"

	// Input data for the workflow
	input := WorkflowInput{
		UserName: "Alice",
	}

	// Marshal input to JSON
	jsonData, err := json.Marshal(input)
	if err != nil {
		return fmt.Errorf("failed to marshal input: %v", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %v", err)
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// The response is the workflowId
	fmt.Printf("Workflow triggered successfully. Workflow ID: %s\n", string(body))
	return nil
}

func main() {
	err := triggerWorkflow()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	}
}
