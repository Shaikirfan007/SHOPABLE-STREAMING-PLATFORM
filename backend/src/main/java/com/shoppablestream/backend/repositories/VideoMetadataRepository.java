package com.shoppablestream.backend.repositories;

import com.shoppablestream.backend.models.VideoMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoMetadataRepository extends MongoRepository<VideoMetadata, String> {
}
