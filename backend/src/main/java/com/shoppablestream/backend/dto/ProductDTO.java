package com.shoppablestream.backend.dto;

public class ProductDTO {
    private Long id;
    private String label;
    private String title;
    private Double price;
    private String description;
    private String category;
    private String image;
    private String shopUrl; // Direct shopping link

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getShopUrl() { return shopUrl; }
    public void setShopUrl(String shopUrl) { this.shopUrl = shopUrl; }
}
