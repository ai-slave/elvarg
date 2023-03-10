import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

import Typography from 'components/UI/Typography';
import Lp from 'components/zdte/LpTradeBox/Lp';
import Trade from 'components/zdte/LpTradeBox/Trade';

const buttonLabels = ['LP', 'Trade'];

const ManageCard = () => {
  const [active, setActive] = useState<string>('LP');

  const handleClick = useCallback((e: any) => {
    setActive(e.target.textContent);
  }, []);

  const renderComponent = active === 'LP' ? <Lp /> : <Trade />;

  return (
    <Box className="flex flex-col bg-cod-gray rounded-xl p-2 space-y-3 w-[348px]">
      <ButtonGroup className="flex w-full justify-between bg-cod-gray border border-umbra rounded-lg">
        {buttonLabels.map((label, index) => (
          <Button
            key={index}
            className={`border-0 hover:border-0 w-full m-1 p-1 transition ease-in-out duration-500 ${
              active === label
                ? 'text-white bg-carbon hover:bg-carbon'
                : 'text-stieglitz bg-transparent hover:bg-transparent'
            } hover:text-white`}
            disableRipple
            onClick={handleClick}
          >
            <Typography variant="h6">{label}</Typography>
          </Button>
        ))}
      </ButtonGroup>
      {renderComponent}
    </Box>
  );
};

export default ManageCard;
