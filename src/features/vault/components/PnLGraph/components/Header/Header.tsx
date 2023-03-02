import { Collapse, Hidden, makeStyles } from '@material-ui/core';
import { ExpandMore, HelpOutline } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import React, { memo, ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import {
  formatBigUsd,
  formatFullBigNumber,
  formatPercent,
  formatSignificantBigNumber,
} from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultPnl } from '../../../../../data/selectors/analytics';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface HeaderProps {
  vaultId: VaultEntity['id'];
}

export const Header = memo<HeaderProps>(function ({ vaultId }) {
  const { t } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);

  const handleCollapse = useCallback(() => {
    setOpen(prevStatus => !prevStatus);
  }, []);

  const {
    usdBalanceAtDeposit,
    balanceAtDeposit,
    oraclePriceAtDeposit,
    depositUsd,
    deposit,
    oraclePrice,
    tokenDecimals,
    totalYieldUsd,
    totalYield,
    yieldPercentage,
    totalPnlUsd,
    pnlPercentage,
  } = useAppSelector(state => selectVaultPnl(state, vaultId));

  const classes = useStyles();

  return (
    <div className={classes.header}>
      <Hidden mdDown>
        <HeaderItem label={t('At Deposit')} border={false}>
          <SharesValue
            amount={balanceAtDeposit}
            price={oraclePriceAtDeposit}
            decimals={tokenDecimals}
            subValue={formatBigUsd(usdBalanceAtDeposit)}
          />
        </HeaderItem>
        <HeaderItem label={t('Now')}>
          <SharesValue
            amount={deposit}
            price={oraclePrice}
            decimals={tokenDecimals}
            subValue={formatBigUsd(depositUsd)}
          />
        </HeaderItem>

        <HeaderItem label={t('Yield')}>
          <SharesValue
            amount={totalYield}
            price={oraclePrice}
            decimals={tokenDecimals}
            className={classes.greenValue}
            percentage={yieldPercentage}
            subValue={formatBigUsd(totalYieldUsd)}
          />
        </HeaderItem>
      </Hidden>
      <HeaderItem label={t('PNL')}>
        <UsdValue value={totalPnlUsd} percentage={pnlPercentage} />
      </HeaderItem>
      <Hidden lgUp>
        <Collapse className={classes.hideCollapse} in={open} timeout="auto">
          <div className={classes.listMobile}>
            <HeaderItem label={t('At Deposit')}>
              <SharesValue
                amount={balanceAtDeposit}
                price={oraclePriceAtDeposit}
                decimals={tokenDecimals}
                subValue={formatBigUsd(usdBalanceAtDeposit)}
              />
            </HeaderItem>
            <HeaderItem label={t('Now')}>
              <SharesValue
                amount={deposit}
                price={oraclePrice}
                decimals={tokenDecimals}
                subValue={formatBigUsd(depositUsd)}
              />
            </HeaderItem>
            <HeaderItem label={t('Yield')}>
              <SharesValue
                amount={totalYield}
                price={oraclePrice}
                decimals={tokenDecimals}
                className={classes.greenValue}
                percentage={yieldPercentage}
                subValue={formatBigUsd(totalYieldUsd)}
              />
            </HeaderItem>
          </div>
        </Collapse>
        <div className={classes.handleButton} onClick={handleCollapse}>
          {open ? t('Less Info') : t('More Info')}
          <ExpandMore className={clsx(classes.arrow, { [classes.active]: open })} />
        </div>
      </Hidden>
    </div>
  );
});

interface HeaderItemProps {
  label: string;
  border?: boolean;
  children: ReactNode;
}

const HeaderItem = memo<HeaderItemProps>(function ({ label, border = true, children }) {
  const classes = useStyles();

  return (
    <div className={classes.itemContainer}>
      {border && <div className={classes.border} />}
      <div className={classes.textContainer}>
        <div className={classes.labelContainer}>
          <div className={classes.label}>{label}</div>
          <Tooltip triggerClass={classes.center} content="pablo S2 u">
            <HelpOutline />
          </Tooltip>
        </div>
        {children}
      </div>
    </div>
  );
});

interface UsdValueProps {
  value: BigNumber;
  className?: string;
  percentage?: BigNumber;
}

const UsdValue = memo<UsdValueProps>(function ({ value, className, percentage }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.value, className)}>
      <div>{formatBigUsd(value)}</div>
      {percentage && <span>({formatPercent(percentage)})</span>}
    </div>
  );
});

interface SharesValueProps {
  className?: string;
  percentage?: BigNumber;
  minShortPlaces?: number;
  amount?: BigNumber;
  decimals?: number;
  price: BigNumber;
  subValue?: string;
}

const SharesValue = memo<SharesValueProps>(function ({
  className,
  percentage,
  amount,
  decimals,
  minShortPlaces = 2,
  price,
  subValue,
}) {
  const classes = useStyles();

  const fullAmount = formatFullBigNumber(amount, decimals);
  const shortAmount = formatSignificantBigNumber(amount, decimals, price, 0, minShortPlaces);

  return (
    <Tooltip content={<BasicTooltipContent title={fullAmount} />}>
      <div>
        <div className={clsx(classes.value, className)}>
          <div
            className={clsx(classes.withTooltip, { [classes.textOverflow]: Boolean(percentage) })}
          >
            {shortAmount}
          </div>
          {percentage && <span>({formatPercent(percentage)})</span>}
        </div>
        {subValue && <div className={classes.subValue}>{subValue}</div>}
      </div>
    </Tooltip>
  );
});
