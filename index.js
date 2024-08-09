const path = require('node:path');
const express = require('express');
const app = express();
// ejsをビューエンジンに指定
app.set('view engine', 'ejs');
// publicディレクトリ以下のファイルを静的ファイルとして配信
app.use('/static', express.static(path.join(__dirname, 'public')));
const { MongoClient } = require('mongodb');
const client = new 
MongoClient('mongodb://localhost:27017');

const logMiddleware = (req, res, next) => {
    console.log(req.method, req.path);
    next();
}


// GET '/user/:id' に一致するGETの挙動
app.get('/user/:id',
    logMiddleware,
     (req, res) => {
        // :idをreq.params.idとして受け取る
        res.status(200).send(req.params.id);
    }
);


async function main() {
  // サーバーのlisten前に接続する
  await client.connect();

  const db = client.db('my-app');

    // ルーティングとミドルウェア
  app.get(
    '/',
    // 追加したミドルウェア
    logMiddleware,
    // 元のミドルウェア
    async(req, res) => {
        const groups = await db.collection('groups').find().toArray();
        const groupData = groups.reduce((acc, group) => {
            acc[group.name] = group.names;
            return acc;
        }, { A: [], B: [], C: [] });
        res.render(path.resolve(__dirname, 'views/index.ejs'),{ group: groupData });
    }
  )

  async function insertUser(groupName, name) {
        if (!groupName || !name) {
            return res.status(400).send('グループ名と名前を入力してください。');
        }

        if (!['A', 'B', 'C'].includes(groupName)) {
            return res.status(400).send('無効なグループ名です。');
        }
        await db.collection('groups').updateOne({ name: groupName},{ $push: { names: name } }, { upsert: true });
         return { status: 200, body: 'Created' };
    }

  app.post('/api/user', express.json(), async (req, res) => {
    const { group, name } = req.body;

    const { status, body } = await insertUser(group, name);
    res.status(status).send(body);
});

// 包括的エラーハンドリング
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });
  

  app.listen(3000, () => {
    console.log('start listening');
  });

}
main();