const express = require('express');
const { account_character_sale, players, accounts } = require('../models');
const { checkJwt } = require('../middlewares/jwt');
const { getMessage } = require('../helpers/messages');
const moment = require('moment');

const router = express.Router();

router.post('/sellchar', checkJwt, async (req, res) => {
  const { body, account_id } = req;
  const { characterName, priceInCoins, recoveryKey, descriptionChar } = body;

  // E1U6-IGOL-Y1EW-E0IL
  const minLevel = 100;
  const accountSeller = 1;

  const checkPlayerExists = await players.findOne({
    where: { name: characterName },
  });

  if (!checkPlayerExists)
    return res.jsonBadRequest(
      null,
      getMessage(
        'The character you are trying to sell is not yours or does not exist.'
      )
    );

  if (checkPlayerExists[0].level <= 100)
    return res.jsonBadRequest(
      null,
      getMessage('Your character does not have the minimum level for sale.')
    );

  const verifyRecoveryKey = await accounts.findOne({
    where: { id: checkPlayerExists.account_id, key: recoveryKey },
  });

  if (verifyRecoveryKey === null)
    return res.jsonBadRequest(
      null,
      getMessage(
        'The entered rk is not a valid rk or does not belong to that account, check and try again.'
      )
    );

  if (verifyRecoveryKey.id !== account_id)
    return res.jsonBadRequest(
      null,
      getMessage(
        'The account of the character you are trying to sell is not the same one you are logged in, redo your operation..'
      )
    );

  const createCharacterSale = await account_character_sale.create({
    id_account: account_id,
    id_player: checkPlayerExists.id,
    status: 0,
    price_type: 0,
    price_coins: priceInCoins,
    price_gold: 0,
    description: descriptionChar,
    dta_insert: moment().format('YYYY-MM-DD HH:m:s'),
    dta_valid: moment().add(7, 'd').format('YYYY-MM-DD HH:m:s'),
    dta_sale: null,
  });

  checkPlayerExists.update({
    account_id: accountSeller,
  });

  return res.jsonOK(createCharacterSale);
});

module.exports = router;
