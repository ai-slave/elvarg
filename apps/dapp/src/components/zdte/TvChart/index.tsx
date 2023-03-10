import { Box } from '@mui/material';
import axios from 'axios';
import Tables from 'components/atlantics/InsuredPerps/Tables';
import TVChart from 'components/atlantics/InsuredPerps/TVChart';
import { FC, useCallback, useEffect, useState } from 'react';
import { useBoundStore } from 'store';
import { GmxCandleStick } from 'types';

interface ZdteTvChartProps {}

export const periods = ['1D', '4H', '1H', '15M', '5M'] as const;
export type Period = (typeof periods)[number];

const ZdteTvChart: FC<ZdteTvChartProps> = ({}) => {
  const [gmxChartData, setGmxChartData] = useState<GmxCandleStick[]>([]);
  const [period, setPeriod] = useState<Period>('1D');
  const [triggerMarker, setTriggerMarker] = useState<string>();

  const { chainId } = useBoundStore();
  const underlying = 'ETH';

  const updatePriceData = useCallback(async () => {
    if (!chainId || !underlying) return;
    const res: Response = await new Promise(async (resolve, reject) => {
      let done = false;
      setTimeout(() => {
        done = true;
        reject(new Error(`Request timeout`));
      }, 10000);

      let lastEx;
      for (let i = 0; i < 3; i++) {
        if (done) return;
        try {
          const res = await fetch(
            `https://stats.gmx.io/api/candles/${'ETH'}?preferableChainId=${chainId}&period=${period}&from=${
              Math.ceil(Number(new Date()) / 1000) - 86400 * 100
            }&preferableSource=fast`
          );
          resolve(res);
          return;
        } catch (ex) {
          lastEx = ex;
        }
      }
      reject(lastEx);
    });
    if (!res.ok) throw new Error('request failed');
    const json = await res.json();
    let prices: GmxCandleStick[] = json?.prices.map(
      (candleStickData: {
        h: number;
        l: number;
        o: number;
        c: number;
        t: number;
      }) => ({
        high: candleStickData.h,
        low: candleStickData.l,
        open: candleStickData.o,
        close: candleStickData.c,
        time: candleStickData.t,
      })
    );

    setGmxChartData(prices);
  }, [chainId, period, underlying]);

  useEffect(() => {
    updatePriceData();
  }, [updatePriceData]);

  return (
    <div>
      <Box className="h-[546px] w-full space-y-4 flex flex-col bg-cod-gray rounded-xl text-center">
        <TVChart
          data={gmxChartData}
          triggerMarker={triggerMarker ?? '0'}
          period={period}
          setPeriod={setPeriod}
          colors={{
            backgroundColor: 'rgb(21, 21, 21)',
            lineColor: '#2962FF',
            textColor: 'white',
            areaTopColor: 'rgba(109, 255, 185, 0.2)',
            areaBottomColor: 'rgba(41, 98, 255, 0.1)',
          }}
        />
      </Box>
    </div>
  );
};

export default ZdteTvChart;
