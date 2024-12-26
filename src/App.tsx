import { useEffect, useState } from "react";
import "./App.css";
import { cn } from "./util";
import crc8 from "crc/crc8";
type Result = {
  blocks: string[];
  checksums: string[];
  correctChecksums: string[];
}[];
function App() {
  const [slice] = useState(16);
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result>([]);
  const [correctChecksumsText, setCorrectChecksumsText] = useState<string>("");
  const [visibleChecksums, setVisibleChecksums] = useState(true);
  const [showDifference, setShowDifference] = useState(true);

  useEffect(() => {
    const correctChecksums = correctChecksumsText
      .split("\n")
      .map((line) => line.split(" ") /* .filter((c) => c !== " ") */);

    const arrays: string[][] = [];
    const lines = text.split("\n");
    for (const line of lines) {
      const array = [];
      for (let i = 0; i < line.length; i += slice) {
        array.push(line.substring(i, i + slice));
      }
      arrays.push(array);
    }
    const object: Result = [];
    for (const [i, lineBlocks] of arrays.entries()) {
      const lineObj: Result[number] = {
        blocks: lineBlocks,
        checksums: [],
        correctChecksums: correctChecksums[i] ?? [],
      };
      for (const block of lineBlocks) {
        lineObj.checksums.push(crc8(block).toString(16).padStart(2, "0"));
      }
      object.push(lineObj);
    }
    setResult(object);
  }, [text, correctChecksumsText, slice]);
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 gap-5">
      <h1 className="text-5xl font-bold akeome">あけおめ</h1>
      <a
        href="https://keys.openpgp.org/vks/v1/by-fingerprint/E6FBD0BFDB69CCCEBDDD77198A9869D6C11124B6"
        className="text-blue-500 hover:text-blue-700 underline"
      >
        なおちきの公開鍵
      </a>
      <h2>年賀状解読補助ツール</h2>
      <div className="w-full flex flex-col gap-4 items-center xl:flex-row justify-center">
        <div className="rounded-xl font-mono w-full h-[35rem] max-w-5xl flex flex-col justify-center bg-slate-800 text-white p-4">
          <p className="text-xl font-sans">1. 暗号文</p>
          <p className="mb-4">-----BEGIN PGP MESSAGE-----</p>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            className="h-full field-sizing-content bg-black"
          ></textarea>
          <p>-----END PGP MESSAGE-----</p>
        </div>
        <div className="rounded-xl font-mono h-[30rem] max-w-5xl flex flex-col  justify-center bg-gray-100 p-4">
          <p className="text-xl font-sans">
            2. 年賀状のチェックサム(オプション)
          </p>
          <textarea
            value={correctChecksumsText}
            onChange={(e) => {
              setCorrectChecksumsText(e.target.value);
            }}
            className="h-full"
          ></textarea>
        </div>
      </div>
      <div className="text-center">
        <p>結果</p>
        <p>あとは頑張って直してね</p>
      </div>
      <div>
        <div>
          <input
            type="checkbox"
            onChange={() => setVisibleChecksums(!visibleChecksums)}
            checked={visibleChecksums}
            name="visibleChecksums"
            id="visibleChecksums"
          />
          <label htmlFor="visibleChecksums">チェックサムの表示</label>
        </div>
        <div>
          <input
            type="checkbox"
            onChange={() => setShowDifference(!showDifference)}
            checked={showDifference}
            name="showDifference"
            id="showDifference"
          />
          <label htmlFor="showDifference">一致しているかどうかを表示</label>
        </div>
      </div>
      <div className="font-mono w-max text-sm max-w-5xl flex flex-col  justify-center bg-gray-100 p-4">
        <p className="mb-4">-----BEGIN PGP MESSAGE-----</p>
        {result.map((line, i) => (
          <div key={i} className="grid grid-cols-[1fr,auto] gap-2 ">
            <div
              className="w-max grid gap-2 items-center"
              style={{
                gridTemplateColumns: `repeat(${Math.ceil(
                  64 / slice
                )}, minmax(0, 1fr))`,
              }}
            >
              {line.blocks.map((block, j) => (
                <div
                  key={j}
                  className={cn(
                    "border",
                    showDifference &&
                      line.correctChecksums[j] &&
                      (line.checksums[j] === line.correctChecksums[j]
                        ? "bg-green-400"
                        : "bg-red-400")
                  )}
                >
                  {block}
                </div>
              ))}
            </div>
            <div
              className={cn(
                "grid gap-1",
                visibleChecksums ? "blovk" : "hidden"
              )}
              style={{
                gridTemplateColumns: `repeat(${Math.ceil(
                  64 / slice
                )}, minmax(0, 1fr))`,
              }}
            >
              {line.checksums.map((c, j) => (
                <div
                  key={j}
                  className={cn(
                    "border",
                    showDifference &&
                      (c === line.correctChecksums[j]
                        ? "bg-green-400"
                        : "bg-red-400")
                  )}
                >
                  <span className="block bg-gray-600 text-white">{c}</span>
                  <span> {line.correctChecksums[j]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p>-----END PGP MESSAGE-----</p>
      </div>
      <div className="flex gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            navigator.clipboard.writeText(
              `-----BEGIN PGP MESSAGE-----\n\n${result
                .map((line) => line.blocks.join(""))
                .join("\n")}\n-----END PGP MESSAGE-----`
            );
          }}
        >
          PGPメッセージをコピー
        </button>
        <button
          className="border-2 hover:bg-slate-300 font-bold py-2 px-4 rounded"
          onClick={() => {
            navigator.clipboard.writeText(
              result.map((line) => line.checksums.join(" ")).join("\n")
            );
          }}
        >
          計算されたチェックサムをコピー
        </button>
      </div>
    </main>
  );
}

export default App;
