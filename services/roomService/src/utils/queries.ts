export const getMazeCompletionTime = 'SELECT * FROM maze_completion_time ORDER BY id ASC';

export const insertMazeCompletionTime = `
INSERT INTO maze_completion_time (player_id, username, time) 
VALUES ($1, $2, $3)
`;
