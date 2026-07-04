# Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved
import torch
import cv2
import numpy as np

def edt_triton(data: torch.Tensor):
    """
    Computes the Euclidean Distance Transform (EDT) of a batch of binary images.
    Fallback using cv2.distanceTransform since Triton is not available on Windows.
    """
    assert data.dim() == 3
    device = data.device
    B, H, W = data.shape

    data_np = data.detach().cpu().numpy().astype(np.uint8)
    out_np = np.zeros((B, H, W), dtype=np.float32)

    for i in range(B):
        # cv2.distanceTransform calculates the distance to the closest zero pixel for each non-zero pixel.
        # According to the original docstring, "calculates the L2 distance to the closest zero pixel for each pixel".
        img = data_np[i]
        out_np[i] = cv2.distanceTransform(img, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)

    return torch.from_numpy(out_np).to(device)
