const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Without a Trace',
    author: 'Hera Ngone',
    url: 'http://tempentry.com',
    likes: 0
  });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
];

const initialUsers = [
  {
    username: 'blogmasterblab',
    name: 'Blabby Filet',
    password: 'suchsecret'
  },
  {
    username: 'kazakhing',
    name: 'Borat Sagdiyev',
    password: 'youllneverguessthis'
  }
];

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }

  // const blogObjects = initialBlogs.map((blog) => new Blog(blog));
  // const promiseArray = blogObjects.map((blog) => blog.save());

  // await Promise.all(promiseArray);
});

test('blogs are fetched in JSON format', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('number of blogs fetched equal number of blogs in db', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(initialBlogs.length);
});

test('unique identifier property named id exists', async () => {
  const response = await api.get('/api/blogs');
  response.body.map((blog) => {
    expect(blog.id).toBeDefined();
  });
});

test('a blog can be added to the list', async () => {
  const newBlog = {
    title: 'A Random Blog',
    author: 'Persimmon Tree',
    url: 'http://www.fakerandomblog.com',
    likes: 3
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const newBlogList = await Blog.find({});
  expect(newBlogList).toHaveLength(initialBlogs.length + 1);

  const titles = newBlogList.map((blog) => blog.title);
  expect(titles).toContain('A Random Blog');
});

test('likes property will default to 0 if missing', async () => {
  const noLikesBlog = {
    title: 'The Likely Unliked Blog',
    author: 'Warm Swarm',
    url: 'http://www.likednoteevenonce.com',
  };

  await api
    .post('/api/blogs')
    .send(noLikesBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const newBlogList = await Blog.find({});
  expect(newBlogList[newBlogList.length - 1]).toHaveProperty('likes', 0);
});

test('backend responds with status code 400 when title & url are missing', async () => {
  const noTitleBlog = {
    author: 'Schwan Fawn',
    url: 'http://blog.donottitleme.com',
    likes: 1
  };

  const noUrlBlog = {
    title: 'Tales of the Lost URL',
    author: 'Absent Mind',
    likes: 7
  };

  await api
    .post('/api/blogs')
    .send(noTitleBlog)
    .expect(400);

  await api
    .post('/api/blogs')
    .send(noUrlBlog)
    .expect(400);
});

test('deleting a blog with valid id results in status code 204', async () => {
  const startBlogs = await Blog.find({});
  const deleteBlog = startBlogs[0];

  await api
    .delete(`/api/blogs/${deleteBlog.id}`)
    .expect(204);

  const newBlogList = await Blog.find({});
  expect(newBlogList).toHaveLength(initialBlogs.length - 1);

  const titles = newBlogList.map((blog) => blog.title);
  expect(titles).not.toContain(deleteBlog.title);
});

test('attempt to delete a blog with invalid id results in status code 400', async () => {
  const invalidId = '214mkfd329msdl21934d3d1';

  await api
    .delete(`/api/blogs/${invalidId}`)
    .expect(400);

  const blogListAfter = await Blog.find({});
  expect(blogListAfter).toHaveLength(initialBlogs.length);
});

test('updating blog likes with valid id results in status code 200', async () => {
  const startBlogs = await Blog.find({});
  const oldBlog = startBlogs[0];
  const updateLikes = {
    likes: oldBlog.likes + 1
  };

  await api
    .put(`/api/blogs/${oldBlog.id}`)
    .send(updateLikes)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const blogListAfter = await Blog.find({});
  console.log(oldBlog);
  console.log(blogListAfter[0]);
  expect(blogListAfter[0].id).toBe(oldBlog.id);
  expect(blogListAfter[0].likes).toBe(initialBlogs[0].likes + 1);
});

test('updating blog likes with invalid id results in status code 400', async () => {
  const invalidId = '214mkfd329msdl21934d3d1';

  await api
    .put(`/api/blogs/${invalidId}`)
    .send({ likes: 123 })
    .expect(400);
});

test('updating blog likes with nonexisting id results in status code 404', async () => {
  const validUnmatchedId = await nonExistingId();
  console.log(validUnmatchedId);

  await api
    .put(`/api/blogs/${validUnmatchedId}`)
    .send({ likes: 1 })
    .expect(404);
});

describe('when creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    for (let user of initialUsers) {
      await api
        .post('/api/users')
        .send(user);
    }
  });

  test('creation succeeds with a unique username', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'flashbang',
      name: 'Hardy Har',
      password: 'peakaboo'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length + 1);

    const usernames = endUsers.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with appropriate status code if username taken', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'kazakhing',
      name: 'Azamat Bagatov',
      password: 'missedinborat2'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);

    const names = endUsers.map((user) => user.name);
    expect(names).not.toContain(newUser.name);
  });

  test('creation fails with appropriate status code if username length < 3', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'no',
      name: 'Always No',
      password: 'noforall'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain(`\`username\` (\`${newUser.username}\`) is shorter than the minimum allowed length (3)`);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });

  test('creation fails with appropriate status code if username is missing', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: '',
      name: 'Nameless',
      password: 'nopwfornoname'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` is required');

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });

  test('creation fails with appropriate status code if password length < 3', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'twoisenough',
      name: 'Tutu O\'Toole',
      password: '2t'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });

  test('creation fails with appropriate status code if password is missing', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'unsecured',
      name: 'Naive Naomi',
      password: ''
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
