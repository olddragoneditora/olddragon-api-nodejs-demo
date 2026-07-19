var express = require('express');
var router = express.Router();
var { OLDDRAGON_BASE_URL, apiRequest, isInsufficientScope, NeedsLoginError, redirectToLogin } = require('../lib/oldDragonApi');

function ensureAuthenticated(req, res, next) {
  if (req.user) return next();
  res.redirect('/login');
}

router.use(ensureAuthenticated);

/* GET /personagens - lista os personagens do usuário autenticado. */
/* GET /personagens - lists the authenticated user's characters. */
router.get('/', async function (req, res) {
  try {
    const response = await apiRequest(req, { method: 'get', url: `${OLDDRAGON_BASE_URL}/personagens.json` });
    res.render('personagens/index', { title: 'Personagens', personagens: response.data, user: req.user });
  } catch (error) {
    if (error instanceof NeedsLoginError) return redirectToLogin(req, res);
    console.error('Erro ao buscar personagens:', error.message);
    res.render('error', {
      message: 'Erro ao Buscar Personagens',
      error: { status: error.response?.status || 500, stack: error.message },
      user: req.user,
    });
  }
});

/* GET /personagens/:id - detalhe de um personagem. */
/* GET /personagens/:id - a single character's detail page. */
router.get('/:id', async function (req, res) {
  try {
    const response = await apiRequest(req, {
      method: 'get',
      url: `${OLDDRAGON_BASE_URL}/personagens/${req.params.id}.json`,
    });
    res.render('personagens/show', {
      title: response.data.name,
      personagem: response.data,
      user: req.user,
      pvSuccess: req.query.pv_atualizado === '1',
      pvError: null,
    });
  } catch (error) {
    if (error instanceof NeedsLoginError) return redirectToLogin(req, res);
    console.error('Erro ao buscar personagem:', error.message);
    res.render('error', {
      message: 'Erro ao Buscar Personagem',
      error: { status: error.response?.status || 500, stack: error.message },
      user: req.user,
    });
  }
});

/* POST /personagens/:id/pv - atualiza os PV atuais via PATCH na API. */
/* POST /personagens/:id/pv - updates current HP via a PATCH to the API. */
router.post('/:id/pv', async function (req, res) {
  const healthPoints = Number(req.body.health_points);

  try {
    await apiRequest(req, {
      method: 'patch',
      url: `${OLDDRAGON_BASE_URL}/personagens/${req.params.id}.json`,
      data: { health_points: healthPoints },
    });
    return res.redirect(`/personagens/${req.params.id}?pv_atualizado=1`);
  } catch (error) {
    if (error instanceof NeedsLoginError) return redirectToLogin(req, res);

    const pvError = isInsufficientScope(error)
      ? 'Seu token não tem a permissão "content.write" necessária para esta ação.'
      : `Erro ao atualizar PV (HTTP ${error.response?.status || '?'}).`;

    // Re-fetch the character so the page renders normally alongside the error banner.
    try {
      const response = await apiRequest(req, {
        method: 'get',
        url: `${OLDDRAGON_BASE_URL}/personagens/${req.params.id}.json`,
      });
      return res.render('personagens/show', {
        title: response.data.name,
        personagem: response.data,
        user: req.user,
        pvSuccess: false,
        pvError,
      });
    } catch (fetchError) {
      if (fetchError instanceof NeedsLoginError) return redirectToLogin(req, res);
      console.error('Erro ao buscar personagem após falha no PATCH:', fetchError.message);
      return res.render('error', {
        message: 'Erro ao Atualizar PV',
        error: { status: error.response?.status || 500, stack: error.message },
        user: req.user,
      });
    }
  }
});

module.exports = router;
