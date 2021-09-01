const dummy = (blogs) => {
  blogs;
  return 1;
};

const totalLikes = (blogList) => {
  let allLikes = blogList.reduce((likeSum, currentBlog) => {
    let currentLike = currentBlog.likes;
    return likeSum + currentLike;
  }, 0);

  return allLikes;
};

const favoriteBlog = (blogList) => {
  if (blogList.length === 0) {
    return null;
  }

  let fav = blogList.reduce((previousBlog, currentBlog) => {
    if (currentBlog.likes > previousBlog.likes) {
      return currentBlog;
    }
    return previousBlog;
  });

  let { title, author, likes } = fav;
  return { title, author, likes };
};

const mostBlogs = (blogList) => {
  if (blogList.length === 0) {
    return null;
  }

  return countAll(blogList, 'blogs');
};

const mostLikes = (blogList) => {
  if (blogList.length === 0) {
    return null;
  }

  return countAll(blogList, 'likes');
};

// most-themed helpers: mostBlogs, mostLikes)

const countAll = (blogList, fieldToCount) => {
  let authorsAndCount = {};

  blogList.forEach((blog) => {
    let author = blog.author;
    if (fieldToCount === 'blogs') {
      authorsAndCount[author]
        ? authorsAndCount[author] += 1
        : authorsAndCount[author] = 1;
    } else if (fieldToCount === 'likes') {
      authorsAndCount[author]
        ? authorsAndCount[author] += blog[fieldToCount]
        : authorsAndCount[author] = blog[fieldToCount];
    }
  });

  return authorWithHighestCount(authorsAndCount, fieldToCount);
};

const authorWithHighestCount = (countTally, field) => {
  let highestCount = {};

  for (let author in countTally) {
    if (!highestCount.author) {
      highestCount.author = author;
      highestCount[`${field}`] = countTally[author];
    }
    if (countTally[author] > highestCount[`${field}`]) {
      highestCount.author = author;
      highestCount[`${field}`] = countTally[author];
    }
  }

  return highestCount;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
