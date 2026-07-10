package com.vinu.cms.dto.user;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String fullName;

    private String email;

    private boolean enabled;

    private boolean accountLocked;

    private Set<String> roles;

}

// we will not return pass in response for security reasons.and have roles as set of string instead of set of role object to avoid circular reference and also to avoid sending unnecessary data.
// the circular will happen because role has set of user and user has set of role so when we try to convert to json it will keep on going back and forth between user and role and will never end. so we will just send the role names as string instead of role object.