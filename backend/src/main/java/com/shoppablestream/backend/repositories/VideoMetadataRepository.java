package com.shoppablestream.backend.repositories;

import com.shoppablestream.backend.models.VideoMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoMetadataRepository extends MongoRepository<VideoMetadata, String> {
    Optional<VideoMetadata> findFirstByFilename(String filename);
}
