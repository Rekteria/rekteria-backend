const express = require('express');
const {
  account_character_sale,
  account_character_sale_history,
  players,
  accounts,
  player_items,
} = require('../models');
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
    name: characterName,
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

router.get('/getSellCharacters', checkJwt, async (req, res) => {
  const { account_id } = req;

  const charsOnTheSalesList = await account_character_sale.findAll({
    where: {
      id_account: account_id,
    },
  });

  return res.jsonOK(charsOnTheSalesList);
});

router.post('/backToOldAccount', checkJwt, async (req, res) => {
  const { account_id, body } = req;
  const { name, id_account, id_player } = body;

  const getPlayer = await players.findOne({
    where: {
      name: name,
    },
  });

  if (!getPlayer)
    return res.jsonUnauthorized(null, getMessage('You dont have permission.'));

  await getPlayer.update({
    account_id: account_id,
  });

  const charsOnTheSalesList = await account_character_sale.findOne({
    where: {
      id_account: id_account,
      id_player: id_player,
      name: name,
    },
  });

  charsOnTheSalesList.destroy();

  return res.jsonOK();
});

router.get('/getBazarOffers', checkJwt, async (req, res) => {
  const getAllOfers = await account_character_sale.findAll({
    include: [
      {
        model: players,
        attributes: ['name', 'level', 'vocation', 'sex'],
        include: [
          {
            model: player_items,
          },
        ],
      },
    ],
  });

  return res.jsonOK(getAllOfers);
});

router.post('/buyCharacterOffer', checkJwt, async (req, res) => {
  const { account_id, body } = req;
  const { id_account, id_player, name, price_coins, dta_insert } = body;

  const getCoinsInAccount = await accounts.findOne({
    where: {
      id: account_id,
    },
  });

  if (!getCoinsInAccount)
    return res.jsonUnauthorized(
      null,
      getMessage(
        'There was a problem with your refresh token, please re-login your account and try again.'
      )
    );

  if (getCoinsInAccount.coins < price_coins)
    return res.jsonBadRequest(
      null,
      getMessage(
        'You dont have the necessary coins to buy this character, make a donation.'
      )
    );

  const getCharacterToBuy = await players.findOne({
    where: { name: name, id: id_player },
  });

  if (!getCharacterToBuy)
    return res.jsonBadRequest(
      null,
      getMessage(
        'The character you are trying to buy is not for sale or not found.'
      )
    );

  await getCharacterToBuy.update({
    account_id: account_id,
  });

  await getCoinsInAccount.update({
    coins: getCoinsInAccount.coins - price_coins,
  });

  const charsOnTheSalesList = await account_character_sale.findOne({
    where: {
      id_account: id_account,
      id_player: id_player,
      name: name,
    },
  });

  charsOnTheSalesList.destroy();

  const createHistoryOffer = await account_character_sale_history.create({
    id_old_account: account_id,
    id_player: id_player,
    id_new_account: account_id,
    name: name,
    status: 1,
    price_type: 0,
    price: price_coins,
    char_id: id_player,
    dta_insert: moment(dta_insert).format('YYYY-MM-DD HH:m:s'),
    dta_sale: moment().format('YYYY-MM-DD HH:m:s'),
  });

  return res.jsonOK(createHistoryOffer);
});

module.exports = router;
