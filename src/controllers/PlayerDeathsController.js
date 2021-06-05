const express = require('express');
const { player_deaths, players, guild_membership } = require('../models');
const { Sequelize } = require('sequelize');

const router = express.Router();

router.get('/', async (req, res) => {
  const limit = 50;

  const getLastDeaths = await player_deaths.findAll({
    limit,

    order: [['time', 'DESC']],
    include: [
      {
        model: players,
        attributes: ['name'],
      },
    ],
  });

  return res.jsonOK(getLastDeaths);
});

router.get('/killers', async (req, res) => {
  const getAllDeathsByPlayer = await player_deaths.findAll({
    attributes: ['killed_by'],
    order: [['killed_by', 'ASC']],
    where: { is_player: 1 },
  });

  const cont = [];
  let total = 1;
  for (let i = 0; i < getAllDeathsByPlayer.length; i++) {
    if (
      i < getAllDeathsByPlayer.length - 1 &&
      getAllDeathsByPlayer[i].killed_by ===
        getAllDeathsByPlayer[i + 1].killed_by
    ) {
      total++;
    } else {
      cont.push({
        killed_by: getAllDeathsByPlayer[i].killed_by,
        total_kills: total,
      });
      total = 1;
    }
  }

  const getPlayerIdByName = getAllDeathsByPlayer.map(
    (player) => player.killed_by
  );

  const getPlayer = await players.findAll({
    attributes: ['id', 'name'],
    where: { name: getPlayerIdByName },
  });

  const resultOfPlayerId = getPlayer.map((player) => player.id);

  const returnNameId = getPlayer.map((player) => {
    return {
      name: player.name,
      id: player.id,
    };
  });

  let processedData = cont.map((item, i) =>
    Object.assign({}, item, returnNameId[i])
  );

  const verifyPlayerHaveGuild = await guild_membership.findAll({
    where: {
      player_id: resultOfPlayerId,
    },
  });

  return res.jsonOK({
    totalKills: processedData,
    haveGuilds: verifyPlayerHaveGuild,
  });
});

module.exports = router;
