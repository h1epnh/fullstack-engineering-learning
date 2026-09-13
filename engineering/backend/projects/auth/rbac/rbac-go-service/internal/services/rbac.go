package services

import (
	"errors"
	"rbac-go-service/internal/models"
)

// Role represents a user role in the system
type Role string

const (
	Admin       Role = "admin"
	RegularUser Role = "user" // Renamed to avoid conflict
)

// Permission represents a permission in the system
type Permission string

const (
	Read  Permission = "read"
	Write Permission = "write"
)

// RBACService provides methods for role-based access control
type RBACService struct {
	rolePermissions map[Role][]Permission
	users           map[string]models.User
}

// NewRBACService creates a new RBACService
func NewRBACService() *RBACService {
	service := &RBACService{
		rolePermissions: map[Role][]Permission{
			Admin:       {Read, Write},
			RegularUser: {Read},
		},
		users: make(map[string]models.User),
	}

	return service
}

// CheckPermission checks if a user has a specific permission
func (s *RBACService) CheckPermission(userID string, action string) bool {
	user, exists := s.users[userID]
	if !exists {
		return false
	}

	var permission Permission
	switch action {
	case "read":
		permission = Read
	case "write":
		permission = Write
	default:
		return false
	}

	for _, role := range user.Roles {
		rolePermissions, exists := s.rolePermissions[Role(role)]
		if !exists {
			continue
		}
		for _, p := range rolePermissions {
			if p == permission {
				return true
			}
		}
	}
	return false
}

// AssignRole assigns a role to a user
func (s *RBACService) AssignRole(user *models.User, role Role) error {
	if _, exists := s.rolePermissions[role]; !exists {
		return errors.New("invalid role")
	}
	user.Roles = append(user.Roles, string(role))
	return nil
}
