import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

@Component({
  selector: 'app-article-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-details.component.html',
  styleUrls: ['./article-details.component.scss']
})
export class ArticleDetailsComponent implements OnInit {
  article: Article | null = null;

  private dummyArticles: Article[] = [
    {
      id: '1',
      title: 'Understanding Community Projects',
      content: `<p>This is the full content for <b>Understanding Community Projects</b>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.</p><p>More content here...</p>`,
      imageUrl: '../../assets/images/1.webp',
      date: '2024-03-15',
    },
    {
      id: '2',
      title: 'Success Stories in Community Development',
      content: `<p>This is the full content for <b>Success Stories in Community Development</b>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.</p><p>More content here...</p>`,
      imageUrl: '../../assets/images/2.webp',
      date: '2024-03-14',
    },
    {
      id: '3',
      title: 'Innovation in Local Projects',
      content: `<p>This is the full content for <b>Innovation in Local Projects</b>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.</p><p>More content here...</p>`,
      imageUrl: '../../assets/images/3.jpg',
      date: '2024-03-13',
    },
    {
      id: '4',
      title: 'Community Engagement Strategies',
      content: `<p>This is the full content for <b>Community Engagement Strategies</b>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.</p><p>More content here...</p>`,
      imageUrl: '../../assets/images/4.jpg',
      date: '2024-03-12',
    },
    {
      id: '5',
      title: 'Sustainable Community Development',
      content: `<p>This is the full content for <b>Sustainable Community Development</b>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.</p><p>More content here...</p>`,
      imageUrl: '../../assets/images/5.webp',
      date: '2024-03-11',
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.article = this.dummyArticles.find(a => a.id === id) || null;
  }
} 