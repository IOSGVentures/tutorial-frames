export const fetchTokenData = async (tokenSymbols: string) => {
  const response = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${tokenSymbols}`, {
    headers: {
      "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY as string,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  return response.json();
};

export const getTokenPrice = async (tokenSymbol: string) => {
  try {
    const tokenData = await fetchTokenData(tokenSymbol);
    const tokenArray = tokenData.data[tokenSymbol.toUpperCase()];

    if (!tokenArray || tokenArray.length === 0) {
      throw new Error(`No data found for ${tokenSymbol}`);
    }

    const tokenInfo = tokenArray[0];
    const usdQuote = tokenInfo.quote && tokenInfo.quote.USD;

    if (!usdQuote) {
      throw new Error(`USD quote not available for ${tokenSymbol}`);
    }

    return {
      price: usdQuote.price,
      marketCap: usdQuote.market_cap,
    };
  } catch (error: any) {
    console.error(`Error getting token price for ${tokenSymbol}:`, error.message);
    return {
      price: null,
      marketCap: null,
      error: error.message,
    };
  }
};

export const formatNumber = (num: number) => {
  let formattedNum = num.toFixed(2);
  return formattedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
