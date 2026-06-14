package com.fateen.chatapplicationbackend.presence.service;


import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private final Map<String,Integer> onlineUsers = new ConcurrentHashMap<>(); //Count

    public void userConnected(String username){
        onlineUsers.merge(username,1,Integer::sum);
    }

    public void userDisconnected(String username){
        onlineUsers.computeIfPresent(
                username,
                (key,count)->{
                    if (count<= 1){
                        return null;
                    }
                    return count -1;
                }
        );
    }


    public boolean isOnline(String username) {

        return onlineUsers.containsKey(username);
    }


    public Map<String, Integer> getOnlineUsers() {

        return onlineUsers;
    }



}
