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

  const count = allBlogCount(blogList);
  return authorWithHighestCount(count);
};

const allBlogCount = (blogList) => {
  let authorsAndBlogCount = {};
  blogList.forEach((blog) => {
    let author = blog.author;
    if (!authorsAndBlogCount[author]) {
      authorsAndBlogCount[author] = 1;
    } else {
      authorsAndBlogCount[author] += 1;
    }
  });
  return authorsAndBlogCount;
};

const authorWithHighestCount = (allBlogCount) => {
  let highestCount = {};
  for (let author in allBlogCount) {
    if (!highestCount.author) {
      highestCount.author = author;
      highestCount.blogs = allBlogCount[author];
    } else if (allBlogCount[author] > highestCount.blogs) {
      highestCount.author = author;
      highestCount.blogs = allBlogCount[author];
    }
  }
  return highestCount;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
};
