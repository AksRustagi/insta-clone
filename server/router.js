const router = require('express').Router();
const usersRouter = require('./routers/usersRouter.js');
const postsRouter = require('./routers/postsRouter.js');
const likesRouter = require('./routers/likesRouter.js');
const followingsFollowersRouter = require('./routers/followingsFollowersRouter.js');
const Users = require('./db/models/users.js');
const followingsFollowersController = require('./controllers/followingsFollowersController.js');

router.use('/user', usersRouter);
router.use('/post', postsRouter);
router.use('/like', likesRouter);
router.use('/follow', followingsFollowersRouter);

router.get('/users', async (req, res) => {
  try {
    let users = await Users.findAll();
    res.send(users);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get('/following', async (req, res) => {
  try {
    let followings = await followingsFollowersController.fetchUserFollowings(req.query.username);
    res.send(followings);
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;