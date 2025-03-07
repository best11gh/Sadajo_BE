const { ObjectId } = require('mongodb');
const { getDb } = require('../db'); // DB 연결
const Post = require('../models/Post');
const postService = require('../services/postService');
const BaseResponse = require('../utils/BaseResponse');

// 📌 게시글 생성
const createPost = async (req, res) => {
    try {
        const { userId, title, content, tags } = req.body;

        if (!userId || !title || !content) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "사용자 ID, 제목, 내용은 필수 입력값입니다."))
        }

        if (tags && !Array.isArray(tags)) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "태그는 배열 형태로 입력해야 합니다."))
        }

        const newPost = await postService.createPost({ userId, title, content, tags });
        return res.json(new BaseResponse(status = "success", code = 201, message = "게시글이 성공적으로 생성되었습니다.", data = newPost));
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message));
    }
};

// 📌 모든 게시글 조회
const getAllPosts = async (req, res) => {
    try {
        const posts = await postService.getAllPosts();
        return res.json(new BaseResponse(status = "success", code = 200, message = "모든 게시글 조회가 성공적으로 완료되었습니다.", data = posts));
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message));
    }
};


// 📌 특정 게시글 조회
const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "게시글 ID는 필수 입력값입니다."));
        }

        const post = await postService.getPostById(postId);
        if (!post) {
            return res.json(new BaseResponse(status = "fail", code = 404, message = "존재하지 않는 게시글입니다."));
        }
        return res.json(new BaseResponse(status = "success", code = 200, message = "특정 게시글 조회가 성공적으로 완료되었습니다.", data = post));
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message));
    }
};

// 📌 게시글 수정
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, title, content, tags } = req.body;

        if (!postId || !userId) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "게시글 ID와 사용자 ID는 필수 입력값입니다."));
        }

        if (!title && !content && !tags) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "수정할 내용이 존재하지 않습니다."));
        }

        if (tags && !Array.isArray(tags)) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "태그는 배열 형태로 입력해야 합니다."));
        }

        const updatedData = await postService.updatePost(postId, { userId, title, content, tags });

        if (!updatedData) {
            return res.json(new BaseResponse(status = "fail", code = 404, message = "존재하지 않는 게시글입니다."));
        }

        return res.json(new BaseResponse(status = "success", code = 200, message = "게시글이 성공적으로 수정되었습니다.", data = updatedData));
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message));
    }
};

// 📌 게시글 삭제
const deletePost = async (req, res) => {
    try {
        const { postId, userId } = req.params;

        if (!postId || !userId) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "게시글 ID와 사용자 ID는 필수 입력값입니다."));
        }

        const result = await postService.deletePost(postId, userId);
        return res.json(new BaseResponse(status = "success", code = 200, message = result));
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message));
    }
};

// // 📌 댓글 추가 (내장 문서 사용)
// const addComment = async (req, res) => {
//     try {
//         const { postId } = req.params;
//         const { userId, content } = req.body;
//         const db = getDb();

//         const comment = {
//             _id: new ObjectId(),
//             userId,
//             content,
//             createdAt: new Date()
//         };

//         const result = await db.collection('posts').updateOne( // ✅ posts로 변경
//             { _id: new ObjectId(postId) },
//             { $push: { comments: comment } }
//         );

//         if (result.matchedCount === 0) {
//             return res.status(404).json({ message: `Post ${postId} not found` });
//         }

//         res.json({ message: `Comment added`, comment });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    // addComment
};

// 테스트용 주석
