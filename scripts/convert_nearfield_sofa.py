"""Convert the Aalto near-field SOFA file into a compact browser asset.

Runtime Chrome code cannot parse the HDF5 container used by SOFA without a
large WASM dependency.  This keeps the measured positions and both 512-sample
HRIR channels, but stores the float32 samples as one base64 payload.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
from pathlib import Path

import h5py
import numpy as np


ZENODO_RECORD = "https://zenodo.org/records/7316545"
EXPECTED_MD5 = "3e5b96cbbe2e7e6b39b9d1198cbabfba"


def decoded_attribute(value: object) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return str(value)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    source_bytes = args.source.read_bytes()
    source_md5 = hashlib.md5(source_bytes).hexdigest()
    if source_md5 != EXPECTED_MD5:
        raise ValueError(f"Unexpected source MD5: {source_md5}")

    with h5py.File(args.source, "r") as sofa:
        positions = np.asarray(sofa["SourcePosition"], dtype=np.float64)
        irs = np.asarray(sofa["Data.IR"], dtype="<f4")
        delays = np.asarray(sofa["Data.Delay"], dtype=np.float64)
        sample_rate = float(np.asarray(sofa["Data.SamplingRate"]).reshape(-1)[0])
        coordinate_type = decoded_attribute(sofa["SourcePosition"].attrs["Type"])
        title = decoded_attribute(sofa.attrs["Title"])
        database_name = decoded_attribute(sofa.attrs["DatabaseName"])
        license_name = decoded_attribute(sofa.attrs["License"])

    if irs.ndim != 3 or irs.shape[1] != 2:
        raise ValueError(f"Expected [position, 2, samples] HRIRs, got {irs.shape}")
    if positions.shape != (irs.shape[0], 3):
        raise ValueError("SourcePosition and Data.IR counts do not match")

    radii = sorted({round(float(value), 6) for value in positions[:, 2]})
    compact = {
        "schemaVersion": 1,
        "name": database_name,
        "title": title,
        "source": ZENODO_RECORD,
        "sourceFile": args.source.name,
        "sourceMd5": source_md5,
        "license": license_name,
        "sampleRate": sample_rate,
        "coordinateType": coordinate_type,
        "distanceAware": True,
        "measuredDistancesMeters": radii,
        "positions": np.round(positions, 6).tolist(),
        "delays": delays.tolist(),
        "receiverCount": int(irs.shape[1]),
        "irLength": int(irs.shape[2]),
        "irEncoding": "base64-float32-little-endian-position-receiver-sample",
        "irsBase64": base64.b64encode(irs.tobytes(order="C")).decode("ascii"),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(compact, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(
        f"Wrote {args.output} with {irs.shape[0]} positions, "
        f"{irs.shape[2]} samples, distances {radii}"
    )


if __name__ == "__main__":
    main()
