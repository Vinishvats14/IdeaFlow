package com.vinu.cms.service.impl;

import com.vinu.cms.dto.article.ArticleResponse;
import com.vinu.cms.dto.article.CreateArticleRequest;
import com.vinu.cms.dto.article.UpdateArticleRequest;
import com.vinu.cms.entity.Article;
import com.vinu.cms.entity.Category;
import com.vinu.cms.entity.Tag;
import com.vinu.cms.entity.User;
import com.vinu.cms.enums.ArticleStatus;
import com.vinu.cms.enums.Visibility;
import com.vinu.cms.exception.BadRequestException;
import com.vinu.cms.exception.ResourceNotFoundException;
import com.vinu.cms.repository.ArticleRepository;
import com.vinu.cms.repository.CategoryRepository;
import com.vinu.cms.repository.TagRepository;
import com.vinu.cms.repository.UserRepository;
import com.vinu.cms.repository.NotificationRepository;
import com.vinu.cms.entity.Notification;
import com.vinu.cms.service.ArticleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // for notification and enabling spring stomp for the persistence websocket connection
    private final SimpMessagingTemplate messagingTemplate;
    @Override
    @Transactional
    public ArticleResponse create(CreateArticleRequest request, String authorEmail) {
        if (articleRepository.existsBySlug(resolveSlug(request.getSlug(), request.getTitle()))) {
            throw new BadRequestException("Article slug already exists");
        }

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));

        Article article = Article.builder()
                .slug(resolveSlug(request.getSlug(), request.getTitle()))
                .title(request.getTitle())
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .status(request.getStatus())
                .visibility(request.getVisibility())
                .featured(request.isFeatured())
                .coverImageUrl(request.getCoverImageUrl())
                .readTimeMinutes(request.getReadTimeMinutes())
                .author(author)
                .category(resolveCategory(request.getCategoryId()))
                .tags(resolveTags(request.getTagIds()))
                .build();

        if (request.getStatus() == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }

        Article savedArticle = articleRepository.save(article);

        // 2. Ek badhiya sa notification message taiyar karo.
        String notificationPayload = author.getFullName() + " just published a new article: " + savedArticle.getTitle();

        // 3. Radio station par broadcast karo!
        // Maan lo Author ki ID 123 hai, toh destination banega: "/topic/author/123"
        // Har wo user jisne is topic ko subscribe kiya hua hai, use ye payload mil jayega.
        String destination = "/topic/author/" + author.getId();

        if (savedArticle.getStatus() == ArticleStatus.PUBLISHED) {
            sendNotificationsForArticle(savedArticle, notificationPayload, destination);
        }

        return toResponse(savedArticle);
    }

    @Override
    @Transactional
    public ArticleResponse update(Long id, UpdateArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id " + id));

        String slug = resolveSlug(request.getSlug(), request.getTitle());
        if (!slug.equals(article.getSlug()) && articleRepository.existsBySlug(slug)) {
            throw new BadRequestException("Article slug already exists");
        }

        article.setSlug(slug);
        article.setTitle(request.getTitle());
        article.setExcerpt(request.getExcerpt());
        article.setContent(request.getContent());
        ArticleStatus oldStatus = article.getStatus();

        if (request.getStatus() != null) {
            article.setStatus(request.getStatus());
            if (request.getStatus() == ArticleStatus.PUBLISHED && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }
        if (request.getVisibility() != null) {
            article.setVisibility(request.getVisibility());
        }
        if (request.getFeatured() != null) {
            article.setFeatured(request.getFeatured());
        }
        article.setCoverImageUrl(request.getCoverImageUrl());
        article.setReadTimeMinutes(request.getReadTimeMinutes());
        article.setCategory(resolveCategory(request.getCategoryId()));
        article.setTags(resolveTags(request.getTagIds()));

        Article savedArticle = articleRepository.save(article);

        if (oldStatus != ArticleStatus.PUBLISHED && savedArticle.getStatus() == ArticleStatus.PUBLISHED) {
            User author = savedArticle.getAuthor();
            String notificationPayload = author.getFullName() + " just published a new article: " + savedArticle.getTitle();
            String destination = "/topic/author/" + author.getId();
            sendNotificationsForArticle(savedArticle, notificationPayload, destination);
        }

        return toResponse(savedArticle);
    }

    @Override
    @Transactional
    public ArticleResponse getById(Long id) {
        return toResponse(articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id " + id)));
    }

    @Override
    @Transactional
    public ArticleResponse getBySlug(String slug) {
        return toResponse(articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with slug " + slug)));
    }

    @Override
    @Transactional
    public List<ArticleResponse> listAll(ArticleStatus status, Visibility visibility, String tagSlug, String categorySlug) {
        // Database se direct filtered data lekar aao
        return articleRepository.findByFilters(status, visibility, tagSlug, categorySlug)
                .stream()
                .map(this::toResponse)
                .toList();
    }

//    @Override
//    @Transactional
//    public List<ArticleResponse> listPublic(String tagSlug, String categorySlug) {
//        return articleRepository.findAll().stream()
//                .filter(article -> article.getStatus() == ArticleStatus.PUBLISHED)
//                .filter(article -> article.getVisibility() == Visibility.PUBLIC)
//                .filter(article -> tagSlug == null || article.getTags().stream().anyMatch(tag -> tagSlug.equals(tag.getSlug())))
//                .filter(article -> categorySlug == null || (article.getCategory() != null && categorySlug.equals(article.getCategory().getSlug())))
//                .map(this::toResponse)
//                .toList();
//    }

    @Override
    @Transactional // Sirf fetch ho raha hai, isliye readOnly=true efficient hai
    public List<ArticleResponse> listPublic(String tagSlug, String categorySlug) {

        // Humne purani query ko hi reuse kar liya!
        // status ki jagah hamesha PUBLISHED jayega, aur visibility ki jagah PUBLIC
        return articleRepository.findByFilters(
                        ArticleStatus.PUBLISHED,
                        Visibility.PUBLIC,
                        tagSlug,
                        categorySlug
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id " + id));
        articleRepository.delete(article);
    }

    @Override
    @Transactional
    public ArticleResponse publish(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id " + id));
        ArticleStatus oldStatus = article.getStatus();
        article.setStatus(ArticleStatus.PUBLISHED);
        article.setVisibility(Visibility.PUBLIC);
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        Article savedArticle = articleRepository.save(article);

        if (oldStatus != ArticleStatus.PUBLISHED) {
            User author = savedArticle.getAuthor();
            String notificationPayload = author.getFullName() + " just published a new article: " + savedArticle.getTitle();
            String destination = "/topic/author/" + author.getId();
            sendNotificationsForArticle(savedArticle, notificationPayload, destination);
        }

        return toResponse(savedArticle);
    }

    private void sendNotificationsForArticle(Article savedArticle, String notificationPayload, String destination) {
        User author = savedArticle.getAuthor();
        Set<User> subscribers = author.getSubscribers();
        if (subscribers != null && !subscribers.isEmpty()) {
            for (User subscriber : subscribers) {
                Notification notification = Notification.builder()
                        .type("NEW_ARTICLE")
                        .message(notificationPayload)
                        .readFlag(false)
                        .user(subscriber)
                        .build();
                notificationRepository.save(notification);
            }
        }
        messagingTemplate.convertAndSend(destination, notificationPayload);
    }

    @Override
    @Transactional
    public ArticleResponse archive(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found with id " + id));
        article.setStatus(ArticleStatus.ARCHIVED);
        return toResponse(articleRepository.save(article));
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + categoryId));
    }

    private Set<Tag> resolveTags(Set<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(tagRepository.findAllById(tagIds));
    }

    private ArticleResponse toResponse(Article article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .slug(article.getSlug())
                .title(article.getTitle())
                .excerpt(article.getExcerpt())
                .content(article.getContent())
                .status(article.getStatus())
                .visibility(article.getVisibility())
                .featured(article.isFeatured())
                .coverImageUrl(article.getCoverImageUrl())
                .readTimeMinutes(article.getReadTimeMinutes())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .authorName(article.getAuthor().getFullName())
                .authorEmail(article.getAuthor().getEmail())
                .authorId(article.getAuthor().getId())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(article.getCategory() != null ? article.getCategory().getName() : null)
                .tags(article.getTags().stream().map(Tag::getSlug).collect(Collectors.toSet()))
                .build();
    }

    private String resolveSlug(String slug, String title) {
        String value = (slug == null || slug.isBlank()) ? title : slug;
        return value.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
//
//Isko humne Business Logic Layer (ArticleService) mein likha hai, wo bhi articleRepository.save(article) ke theek baad. Kyun? Kyunki agar database mein save hone se pehle hi error aa gaya (jaise database crash ya validation fail), toh notification nahi jaani chahiye. Jab database confirm kar deta hai ki "Ha, article save ho gaya", tabhi hum notification bhejte hain.
//Isse Kya Hoga?
//Jaise hi code messagingTemplate.convertAndSend() par pahuchega, backend turant ek message pack karega aur use /topic/author/123 par phenk (broadcast) dega.
//Isse database ka naya data aur real-time event dono sync ho jaate hain.