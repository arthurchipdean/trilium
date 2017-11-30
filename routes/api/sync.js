"use strict";

const express = require('express');
const router = express.Router();
const auth = require('../../services/auth');
const sync = require('../../services/sync');
const syncUpdate = require('../../services/sync_update');
const sql = require('../../services/sql');
const options = require('../../services/options');
const content_hash = require('../../services/content_hash');

router.get('/check', auth.checkApiAuth, async (req, res, next) => {
    res.send({
        'content_hash': await content_hash.getContentHash(),
        'max_sync_id': await sql.getSingleValue('SELECT MAX(id) FROM sync')
    });
});

router.post('/now', auth.checkApiAuth, async (req, res, next) => {
    res.send(await sync.sync());
});

router.get('/changed', auth.checkApiAuth, async (req, res, next) => {
    const lastSyncId = parseInt(req.query.lastSyncId);

    res.send(await sql.getResults("SELECT * FROM sync WHERE id > ?", [lastSyncId]));
});

router.get('/notes/:noteId', auth.checkApiAuth, async (req, res, next) => {
    const noteId = req.params.noteId;

    res.send({
        entity: await sql.getSingleResult("SELECT * FROM notes WHERE note_id = ?", [noteId])
    });
});

router.get('/notes_tree/:noteTreeId', auth.checkApiAuth, async (req, res, next) => {
    const noteTreeId = req.params.noteTreeId;

    res.send(await sql.getSingleResult("SELECT * FROM notes_tree WHERE note_tree_id = ?", [noteTreeId]));
});

router.get('/notes_history/:noteHistoryId', auth.checkApiAuth, async (req, res, next) => {
    const noteHistoryId = req.params.noteHistoryId;

    res.send(await sql.getSingleResult("SELECT * FROM notes_history WHERE note_history_id = ?", [noteHistoryId]));
});

router.get('/options/:optName', auth.checkApiAuth, async (req, res, next) => {
    const optName = req.params.optName;

    if (!options.SYNCED_OPTIONS.includes(optName)) {
        res.send("This option can't be synced.");
    }
    else {
        res.send(await sql.getSingleResult("SELECT * FROM options WHERE opt_name = ?", [optName]));
    }
});

router.get('/notes_reordering/:noteTreeParentId', auth.checkApiAuth, async (req, res, next) => {
    const noteTreeParentId = req.params.noteTreeParentId;

    res.send({
        note_pid: noteTreeParentId,
        ordering: await sql.getMap("SELECT note_tree_id, note_pos FROM notes_tree WHERE note_pid = ?", [noteTreeParentId])
    });
});

router.get('/recent_notes/:notePath', auth.checkApiAuth, async (req, res, next) => {
    const notePath = req.params.notePath;

    res.send(await sql.getSingleResult("SELECT * FROM recent_notes WHERE note_path = ?", [notePath]));
});

router.put('/notes', auth.checkApiAuth, async (req, res, next) => {
    await syncUpdate.updateNote(req.body.entity, req.body.sourceId);

    res.send({});
});

router.put('/notes_tree', auth.checkApiAuth, async (req, res, next) => {
    await syncUpdate.updateNoteTree(req.body.entity, req.body.sourceId);

    res.send({});
});

router.put('/notes_history', auth.checkApiAuth, async (req, res, next) => {
    await syncUpdate.updateNoteHistory(req.body.entity, req.body.sourceId);

    res.send({});
});

router.put('/notes_reordering', auth.checkApiAuth, async (req, res, next) => {
    await syncUpdate.updateNoteReordering(req.body.entity, req.body.sourceId);

    res.send({});
});

router.put('/options', auth.checkApiAuth, async (req, res, next) => {
    await syncUpdate.updateOptions(req.body.entity, req.body.sourceId);

    res.send({});
});

router.put('/recent_notes', auth.checkApiAuth, async (req, res, next) => {
    await syncUpdate.updateRecentNotes(req.body.entity, req.body.sourceId);

    res.send({});
});

module.exports = router;