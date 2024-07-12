/** @jsxImportSource frog/jsx */

import { formatNumber, getTokenPrice } from "@/utils";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from "frog/hubs";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  assetsPath: "/",
  basePath: `/api`,
  title: "Frame Market Cap",
  // uncomment to enable verification
  // hub: neynar({ apiKey: "NEYNAR_FROG_FM" }),
});

app.frame("/", (c) => {
  return c.res({
    action: "/compare",
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            whiteSpace: "pre-wrap",
          }}
        >
          {"Check the price of A\n with the market cap of B!"}
        </div>
      </div>
    ),
    intents: [<TextInput placeholder="TOKENA,TOKENB" />, <Button value="mine">Check Now!</Button>],
  });
});

app.frame("/compare", async (c) => {
  // console.log({ c });

  const { inputText = "" } = c;

  // use this instead when verification is enabled
  // const { frameData, verified } = c
  // const { inputText = ""} = frameData || {}

  try {
    const tokens = inputText.split(",");
    if (tokens.length < 2) {
      throw new Error("Invalid input. Please provide two tokens separated by a comma.");
    }

    const tokenA = tokens[0].toUpperCase();
    const tokenB = tokens[1].toUpperCase();

    const { price: priceA, marketCap: marketCapA, error: errorA } = await getTokenPrice(tokenA);
    const { price: priceB, marketCap: marketCapB, error: errorB } = await getTokenPrice(tokenB);

    if (errorA || errorB) {
      throw new Error(errorA || errorB);
    }

    const multiplier = marketCapB / marketCapA;
    const calculatedPrice = multiplier * priceA;

    return c.res({
      action: "/",
      image: (
        <div
          style={{
            alignItems: "center",
            background: "black",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
            color: "white",
            whiteSpace: "pre-wrap",
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 20,
            }}
          >
            {`${tokenA} with the market cap of ${tokenB}`}
          </div>
          <div
            style={{
              fontSize: 80,
              marginBottom: 30,
            }}
          >
            {`$${formatNumber(calculatedPrice)} (${formatNumber(multiplier)}x)`}
          </div>
          <div
            style={{
              fontSize: 30,
            }}
          >
            {`${tokenA} Market Cap: $${formatNumber(marketCapA)}\n${tokenB} Market Cap: $${formatNumber(marketCapB)}`}
          </div>
        </div>
      ),
      intents: [<Button>Try Another Pair</Button>],
    });
  } catch (error: any) {
    console.error("Error occurred:", error.message);
    return c.res({
      action: "/",
      image: (
        <div
          style={{
            alignItems: "center",
            background: "black",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
            color: "white",
            whiteSpace: "pre-wrap",
          }}
        >
          <div
            style={{
              fontSize: 50,
              marginBottom: 20,
            }}
          >
            {`An Error Has Occurred :(`}
          </div>
          {error.message && (
            <div
              style={{
                fontSize: 30,
                marginBottom: 30,
              }}
            >
              {error.message}
            </div>
          )}
        </div>
      ),
      intents: [<Button>Go Back and Try Again</Button>],
    });
  }
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
