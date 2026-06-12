package com.fateen.chatapplicationbackend.services;

import com.fateen.chatapplicationbackend.models.KeyBackup;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.KeyBackupRequest;
import com.fateen.chatapplicationbackend.models.dto.KeyBackupResponse;
import com.fateen.chatapplicationbackend.models.dto.KeyBackupStatusResponse;
import com.fateen.chatapplicationbackend.repository.AuthRepo;
import com.fateen.chatapplicationbackend.repository.KeyBackupRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class KeyBackupService {

    private final KeyBackupRepo keyBackupRepo;
    private final AuthRepo authRepo;

    public KeyBackupService(
            KeyBackupRepo keyBackupRepo,
            AuthRepo authRepo
    ) {
        this.keyBackupRepo = keyBackupRepo;
        this.authRepo = authRepo;
    }

    public KeyBackupStatusResponse getStatus(String username) {
        User user = getUserByUsername(username);

        return keyBackupRepo.findByUser(user)
                .map(backup -> new KeyBackupStatusResponse(
                        true,
                        backup.getUpdatedAt().toString()
                ))
                .orElseGet(() -> new KeyBackupStatusResponse(
                        false,
                        null
                ));
    }

    public KeyBackupResponse saveBackup(
            String username,
            KeyBackupRequest request
    ) {
        User user = getUserByUsername(username);

        validateRequest(request);

        KeyBackup backup = keyBackupRepo.findByUser(user)
                .orElseGet(KeyBackup::new);

        backup.setUser(user);
        backup.setVersion(request.version());
        backup.setAlgorithm(request.algorithm());
        backup.setKdf(request.kdf());
        backup.setHash(request.hash());
        backup.setIterations(request.iterations());
        backup.setSalt(request.salt());
        backup.setIv(request.iv());
        backup.setEncryptedPrivateKey(request.encryptedPrivateKey());
        backup.setPublicKey(request.publicKey());

        KeyBackup savedBackup = keyBackupRepo.save(backup);

        return toResponse(savedBackup);
    }

    public KeyBackupResponse getBackup(String username) {
        User user = getUserByUsername(username);

        KeyBackup backup = keyBackupRepo.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No encrypted key backup found"
                ));

        return toResponse(backup);
    }

    private User getUserByUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not authenticated"
            );
        }

        return authRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));
    }

    private void validateRequest(KeyBackupRequest request) {
        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request body is required"
            );
        }

        if (isBlank(request.publicKey())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Public key is required"
            );
        }

        if (request.version() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Backup version is required"
            );
        }

        if (isBlank(request.algorithm())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Algorithm is required"
            );
        }

        if (isBlank(request.kdf())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "KDF is required"
            );
        }

        if (isBlank(request.hash())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hash algorithm is required"
            );
        }

        if (request.iterations() == null || request.iterations() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid KDF iterations are required"
            );
        }

        if (isBlank(request.salt())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Salt is required"
            );
        }

        if (isBlank(request.iv())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "IV is required"
            );
        }

        if (isBlank(request.encryptedPrivateKey())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Encrypted private key is required"
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private KeyBackupResponse toResponse(KeyBackup backup) {
        return new KeyBackupResponse(
                backup.getVersion(),
                backup.getAlgorithm(),
                backup.getKdf(),
                backup.getHash(),
                backup.getIterations(),
                backup.getSalt(),
                backup.getIv(),
                backup.getEncryptedPrivateKey(),
                backup.getPublicKey(),
                backup.getCreatedAt().toString(),
                backup.getUpdatedAt().toString()
        );
    }
}