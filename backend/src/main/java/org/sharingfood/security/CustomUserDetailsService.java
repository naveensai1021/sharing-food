package org.sharingfood.security;

import org.sharingfood.entity.User;
import org.sharingfood.entity.UserStatus;
import org.sharingfood.exception.AccountSuspendedException;
import org.sharingfood.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new AccountSuspendedException("Account has been suspended. Please contact platform administration.");
        }
        if (user.getStatus() == UserStatus.DELETED) {
            throw new UsernameNotFoundException("Account does not exist.");
        }

        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new AccountSuspendedException("Account has been suspended.");
        }
        if (user.getStatus() == UserStatus.DELETED) {
            throw new UsernameNotFoundException("Account does not exist.");
        }

        return UserPrincipal.create(user);
    }
}
