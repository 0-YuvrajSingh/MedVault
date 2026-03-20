package com.medvault.service;

import com.medvault.model.User;
import com.medvault.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for User-related operations
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Check if user exists by email
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
