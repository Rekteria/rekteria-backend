const express = require('express');
const {
  player_deaths,
  players,
  guild_membership,
  guilds,
} = require('../models');
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

  const totalKills = [];
  let total = 1;
  for (let i = 0; i < getAllDeathsByPlayer.length; i++) {
    if (
      i < getAllDeathsByPlayer.length - 1 &&
      getAllDeathsByPlayer[i].killed_by ===
        getAllDeathsByPlayer[i + 1].killed_by
    ) {
      total++;
    } else {
      totalKills.push({
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

  const verifyPlayerHaveGuild = await guild_membership.findAll({
    attributes: ['player_id', 'guild_id'],
    order: [['guild_id', 'ASC']],
    include: [
      {
        model: guilds,
        attributes: ['name'],
      },
    ],
    where: {
      player_id: resultOfPlayerId,
    },
  });

  let concatValues = totalKills.map((item, i) =>
    Object.assign({}, item, returnNameId[i])
  );

  let allDatasTogether = [];
  for (const playersInGuild of verifyPlayerHaveGuild) {
    for (const playersWithKills of concatValues) {
      if (playersInGuild.player_id === playersWithKills.id) {
        allDatasTogether.push({
          killed_by: playersWithKills.killed_by,
          total_kills: playersWithKills.total_kills,
          id: playersWithKills.id,
          guild: playersInGuild.guild_id,
          guildName: playersInGuild.guild.name,
        });
      }
    }
  }

  let currentData;
  let nextData;
  let totalGuilds = [];
  let totalGuildKills = 0;
  for (let i = 0; i < allDatasTogether.length - 1; i++) {
    currentData = allDatasTogether[i];
    nextData = allDatasTogether[i + 1];

    if (currentData.guild === nextData.guild) {
      totalGuildKills += currentData.total_kills + nextData.total_kills;
      totalGuilds.push({
        guild: currentData.guild,
        totalKills: totalGuildKills,
        guildName: currentData.guildName,
      });
    } else {
      totalGuilds.push({
        guild: nextData.guild,
        totalKills: nextData.total_kills,
        guildName: nextData.guildName,
      });
    }
  }

  const sortedKills = totalKills.sort((a, b) => b.total_kills - a.total_kills);

  return res.jsonOK({
    TopGuilds: totalGuilds,
    TopKillers: sortedKills,
  });
});

module.exports = router;
