import axios from "axios";
import fs from "fs/promises";

async function readFile() {
    const file = await fs.open("./examples/test.png", "r");
    const stats = await file.stat();
    const buffer = Buffer.alloc(stats.size);
    await file.read(buffer, 0, stats.size, 0);
    await file.close();
    return buffer;
}

function stringTo1KBBuffer(input: string): Buffer {
    const encoded = Buffer.from(input, "utf-8");
    const targetSize = 1024;

    if (encoded.length > targetSize) {
        throw new Error("Input string is too large to fit in 1KB buffer.");
    }

    const padded = Buffer.alloc(targetSize, "%"); // default padding with '%'
    encoded.copy(padded, 0); // copy the original buffer into the start of the padded buffer
    return padded;
}

const collectionId = "f3ede7cb-57ad-4454-a15b-3f4b3a37eeb9";
const url = `http://127.0.0.1:3001/collection/${collectionId}/upload-dataset`;
const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyZXNzIjoiMHhmMzlGZDZlNTFhYWQ4OEY2RjRjZTZhQjg4MjcyNzljZmZGYjkyMjY2IiwiZXhwIjoxNzQ5MDQ1NDMwfQ.BpTIOVVZacjONEL69jqEDDgy-up2NMoDe9DS54nXzys";

const headers = {
    Authorization: "Bearer " + token,
};

const file = await readFile();
// console.log(file.byteLength)
const chunk1 = file.slice(0, 500000);
const chunk2 = file.slice(500000);

await axios.post(
    url,
    Buffer.concat([stringTo1KBBuffer("saliskasep.jpg"), chunk1]),
    {
        headers,
    }
);
await axios.post(url + "?finish=true", chunk2, {
    headers,
});
