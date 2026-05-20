package com.fateen.chatapplicationbackend.services;


import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.UserDTO;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserActionService {


    @Autowired
    private UserActionRepo userActionRepo;

    public UserDTO getUserData(String username){

        User user = userActionRepo.findByUsername(username);

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

    }


    public User getReceiverById(Long receiverId) {

        return userActionRepo.findById(receiverId).orElseThrow();

    }
}
