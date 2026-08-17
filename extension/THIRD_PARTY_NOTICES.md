# Third-party notices

## Aalto University near-field HRTF dataset

Bundled runtime dataset:
`assets/NF_LIB_HRTF_LFE.compact.json`, derived without changing the measured
samples from `NF_LIB_HRTF_LFE.sofa`.

Dataset: *A database of near-field head-related transfer functions based on
measurements with a laser spark source*, version 1.0. Copyright the dataset
authors Márton Marschall, Javier Gómez Bolaños, Sebastian Prepelita, and Ville
Pulkki / Aalto University. Licensed under Creative Commons Attribution 4.0.

- Dataset and original SOFA file: https://doi.org/10.5281/zenodo.7316545
- Accompanying paper: https://doi.org/10.1016/j.apacoust.2022.109173
- License: https://creativecommons.org/licenses/by/4.0/

The bundled compact file contains the low-frequency-extended HRIRs measured at
20, 30, 40, and 50 cm. The conversion changes only the container: SOFA/HDF5
float data is stored as little-endian float32 in a base64 JSON payload for use
inside a Chromium extension.

## serveSofaHrir reference implementation

The upstream `serveSofaHrir` project is BSD-3-Clause licensed, Copyright (c) 2014, Ircam. This extension does not execute upstream remote JavaScript; it uses the public SOFA-JSON data format and an independently written minimal loader/rendering path informed by the documented upstream behavior.
