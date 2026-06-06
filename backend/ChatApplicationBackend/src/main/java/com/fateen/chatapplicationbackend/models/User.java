package com.fateen.chatapplicationbackend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.Nullable;

@Entity
@Table(name = "users",uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String username;
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;


    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setEmail(String email) {
        this.email = email;
    }



    public User(String username, String email, String password) {
        this.username = username;
        this.email=email;
        this.password = password;
    }
}