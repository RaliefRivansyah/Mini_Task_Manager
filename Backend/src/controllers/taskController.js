import * as taskService from '../services/taskService.js';

function handleError(error, response) {
    const status =
        error.message === 'Task not found' ? 404 : error.message.startsWith('Invalid') || error.message === 'Title is required' ? 400 : 500;
    response.status(status).json({ message: error.message });
}

export async function getTasks(request, response) {
    try {
        response.json(await taskService.listTasks());
    } catch (error) {
        handleError(error, response);
    }
}
export async function createTask(request, response) {
    try {
        response.status(201).json(await taskService.createTask(request.body));
    } catch (error) {
        handleError(error, response);
    }
}
export async function updateStatus(request, response) {
    try {
        response.json(await taskService.updateStatus(request.params.id, request.body.status, request.body.actor));
    } catch (error) {
        handleError(error, response);
    }
}
export async function deleteTask(request, response) {
    try {
        await taskService.deleteTask(request.params.id);
        response.status(204).send();
    } catch (error) {
        handleError(error, response);
    }
}
export async function getAuditLogs(request, response) {
    try {
        response.json(await taskService.getAuditLogs(request.params.id));
    } catch (error) {
        handleError(error, response);
    }
}
