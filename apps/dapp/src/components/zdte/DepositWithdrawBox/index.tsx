import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

import Typography from 'components/UI/Typography';
import Deposit from 'components/zdte/DepositWithdrawBox/Deposit';
import Withdraw from 'components/zdte/DepositWithdrawBox/Withdraw';
import Trade from 'components/zdte/DepositWithdrawBox/Trade';

const buttonLabels = ['Deposit', 'Withdraw'];

const ManageCard = () => {
  const [active, setActive] = useState<string>('Deposit');

  const handleClick = useCallback((e: any) => {
    setActive(e.target.textContent);
  }, []);

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
      {active === 'Deposit' ? <Trade /> : <Withdraw />}
    </Box>
  );
};

export default ManageCard;
